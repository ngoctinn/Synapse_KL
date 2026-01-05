"""
Booking Optimizer - OR-Tools CP-SAT Solver để tối ưu hóa phân bổ Staff và Resource.

Bài toán: Resource-Constrained Project Scheduling Problem (RCPSP)
- Mỗi BookingItem là một Task cần được assign Staff + Resource
- Constraints: No-overlap, Skill matching, Time windows
- Objective: Minimize Z = α·C_fair + β·C_pref + γ·C_idle + δ·C_perturb
"""
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Sequence
from uuid import UUID

from ortools.sat.python import cp_model

from app.modules.bookings.schemas import OptimizationResult, OptimizationWeights


@dataclass
class ServiceData:
    """Dữ liệu dịch vụ cần thực hiện."""
    item_id: UUID
    service_id: UUID
    duration: int  # Phút
    buffer_time: int  # Phút nghỉ sau dịch vụ
    required_skill_ids: set[UUID]
    required_resource_group_ids: set[UUID]
    sequence_order: int


@dataclass
class StaffAvailability:
    """Thông tin khả dụng của nhân viên."""
    staff_id: UUID
    skill_ids: set[UUID]
    available_slots: list[tuple[datetime, datetime]]  # Các khoảng thời gian khả dụng


@dataclass
class ResourceAvailability:
    """Thông tin khả dụng của tài nguyên."""
    resource_id: UUID
    group_id: UUID
    available_slots: list[tuple[datetime, datetime]]


@dataclass
class OptimizationInput:
    """Input cho solver."""
    booking_id: UUID
    services: list[ServiceData]
    available_staff: list[StaffAvailability]
    available_resources: list[ResourceAvailability]
    time_window: tuple[datetime, datetime]  # Khung giờ mong muốn
    preferred_staff_id: UUID | None = None
    weights: OptimizationWeights = field(default_factory=OptimizationWeights)


@dataclass
class Assignment:
    """Kết quả assignment cho một item."""
    item_id: UUID
    staff_id: UUID
    resource_id: UUID | None
    scheduled_start: datetime
    scheduled_end: datetime


def _datetime_to_minutes(dt: datetime, base: datetime) -> int:
    """Chuyển datetime thành số phút tính từ base."""
    delta = dt - base
    return int(delta.total_seconds() / 60)


def _minutes_to_datetime(minutes: int, base: datetime) -> datetime:
    """Chuyển số phút thành datetime."""
    return base + timedelta(minutes=minutes)


class BookingOptimizer:
    """
    OR-Tools CP-SAT Solver cho booking optimization.

    Workflow:
    1. Nhận input (services, staff availability, resource availability)
    2. Tạo model với interval variables cho mỗi task
    3. Thêm constraints (no-overlap, skill matching)
    4. Định nghĩa objective function
    5. Solve và trả về kết quả
    """

    def __init__(self, input_data: OptimizationInput, timeout_seconds: int = 30):
        self.input = input_data
        self.timeout = timeout_seconds
        self.model = cp_model.CpModel()

        # WHY: Dùng thời điểm bắt đầu của time_window làm base để tính offset
        self.base_time = input_data.time_window[0]
        self.horizon = _datetime_to_minutes(input_data.time_window[1], self.base_time)

        # Variables storage
        self.task_starts: dict[UUID, cp_model.IntVar] = {}
        self.task_ends: dict[UUID, cp_model.IntVar] = {}
        self.task_intervals: dict[UUID, cp_model.IntervalVar] = {}
        self.staff_assignments: dict[tuple[UUID, UUID], cp_model.IntVar] = {}  # (item_id, staff_id) -> bool
        self.resource_assignments: dict[tuple[UUID, UUID], cp_model.IntVar] = {}  # (item_id, resource_id) -> bool

    def _filter_eligible_staff(self, service: ServiceData) -> list[StaffAvailability]:
        """Lọc staff có đủ kỹ năng cho service."""
        eligible = []
        for staff in self.input.available_staff:
            # WHY: Hard constraint - staff phải có TẤT CẢ kỹ năng yêu cầu
            if service.required_skill_ids.issubset(staff.skill_ids):
                eligible.append(staff)
        return eligible

    def _filter_eligible_resources(self, service: ServiceData) -> list[ResourceAvailability]:
        """Lọc resources thuộc group yêu cầu."""
        eligible = []
        for resource in self.input.available_resources:
            if resource.group_id in service.required_resource_group_ids:
                eligible.append(resource)
        return eligible

    def _create_variables(self):
        """Tạo biến cho mỗi task."""
        for service in self.input.services:
            item_id = service.item_id
            duration = service.duration + service.buffer_time

            # Start, End, Interval variables
            start = self.model.NewIntVar(0, self.horizon - duration, f"start_{item_id}")
            end = self.model.NewIntVar(duration, self.horizon, f"end_{item_id}")
            interval = self.model.NewIntervalVar(start, duration, end, f"interval_{item_id}")

            self.task_starts[item_id] = start
            self.task_ends[item_id] = end
            self.task_intervals[item_id] = interval

            # Staff assignment variables
            eligible_staff = self._filter_eligible_staff(service)
            for staff in eligible_staff:
                var = self.model.NewBoolVar(f"assign_{item_id}_{staff.staff_id}")
                self.staff_assignments[(item_id, staff.staff_id)] = var

            # Resource assignment variables
            eligible_resources = self._filter_eligible_resources(service)
            for resource in eligible_resources:
                var = self.model.NewBoolVar(f"resource_{item_id}_{resource.resource_id}")
                self.resource_assignments[(item_id, resource.resource_id)] = var

    def _add_assignment_constraints(self):
        """Mỗi task phải được assign đúng 1 staff và 1 resource (nếu cần)."""
        for service in self.input.services:
            item_id = service.item_id

            # Exactly one staff
            staff_vars = [
                var for (iid, sid), var in self.staff_assignments.items()
                if iid == item_id
            ]
            if staff_vars:
                self.model.AddExactlyOne(staff_vars)

            # Exactly one resource (nếu service yêu cầu)
            if service.required_resource_group_ids:
                resource_vars = [
                    var for (iid, rid), var in self.resource_assignments.items()
                    if iid == item_id
                ]
                if resource_vars:
                    self.model.AddExactlyOne(resource_vars)

    def _add_no_overlap_constraints(self):
        """Staff và Resource không thể phục vụ 2 task cùng lúc."""
        # No-overlap cho mỗi staff
        for staff in self.input.available_staff:
            staff_id = staff.staff_id
            intervals = []

            for service in self.input.services:
                item_id = service.item_id
                key = (item_id, staff_id)

                if key in self.staff_assignments:
                    # WHY: Tạo optional interval - chỉ active khi staff được assign
                    optional_interval = self.model.NewOptionalIntervalVar(
                        self.task_starts[item_id],
                        service.duration + service.buffer_time,
                        self.task_ends[item_id],
                        self.staff_assignments[key],
                        f"opt_staff_{item_id}_{staff_id}"
                    )
                    intervals.append(optional_interval)

            if intervals:
                self.model.AddNoOverlap(intervals)

        # No-overlap cho mỗi resource
        for resource in self.input.available_resources:
            resource_id = resource.resource_id
            intervals = []

            for service in self.input.services:
                item_id = service.item_id
                key = (item_id, resource_id)

                if key in self.resource_assignments:
                    optional_interval = self.model.NewOptionalIntervalVar(
                        self.task_starts[item_id],
                        service.duration + service.buffer_time,
                        self.task_ends[item_id],
                        self.resource_assignments[key],
                        f"opt_resource_{item_id}_{resource_id}"
                    )
                    intervals.append(optional_interval)

            if intervals:
                self.model.AddNoOverlap(intervals)

    def _add_sequence_constraints(self):
        """Các task trong cùng booking phải theo thứ tự."""
        sorted_services = sorted(self.input.services, key=lambda s: s.sequence_order)

        for i in range(len(sorted_services) - 1):
            current = sorted_services[i]
            next_svc = sorted_services[i + 1]

            # WHY: Task sau phải bắt đầu sau khi task trước kết thúc
            self.model.Add(
                self.task_starts[next_svc.item_id] >= self.task_ends[current.item_id]
            )

    def _add_objective(self):
        """Định nghĩa hàm mục tiêu."""
        weights = self.input.weights
        objectives = []

        # β - Preference: Ưu tiên staff khách yêu cầu
        if self.input.preferred_staff_id:
            preference_penalties = []
            for service in self.input.services:
                item_id = service.item_id
                key = (item_id, self.input.preferred_staff_id)

                if key in self.staff_assignments:
                    # WHY: Penalty = 0 nếu được preferred staff, = 1 nếu không
                    not_preferred = self.model.NewBoolVar(f"not_pref_{item_id}")
                    self.model.Add(not_preferred == 1).OnlyEnforceIf(
                        self.staff_assignments[key].Not()
                    )
                    self.model.Add(not_preferred == 0).OnlyEnforceIf(
                        self.staff_assignments[key]
                    )
                    preference_penalties.append(not_preferred)

            if preference_penalties:
                objectives.append(weights.preference * sum(preference_penalties))

        # Minimize total end time (proxy cho idle time)
        if self.input.services:
            max_end = self.model.NewIntVar(0, self.horizon, "max_end")
            self.model.AddMaxEquality(
                max_end,
                [self.task_ends[s.item_id] for s in self.input.services]
            )
            objectives.append(weights.idle_time * max_end)

        if objectives:
            self.model.Minimize(sum(objectives))

    def solve(self) -> OptimizationResult:
        """Chạy solver và trả về kết quả."""
        # Build model
        self._create_variables()

        # Check feasibility: Mỗi service phải có ít nhất 1 staff eligible
        for service in self.input.services:
            eligible = self._filter_eligible_staff(service)
            if not eligible:
                return OptimizationResult(
                    success=False,
                    status="INFEASIBLE",
                    message=f"Không có nhân viên nào có đủ kỹ năng cho dịch vụ {service.service_id}",
                )

        self._add_assignment_constraints()
        self._add_no_overlap_constraints()
        self._add_sequence_constraints()
        self._add_objective()

        # Solve
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = self.timeout

        status = solver.Solve(self.model)

        # Map status
        status_map = {
            cp_model.OPTIMAL: ("OPTIMAL", True),
            cp_model.FEASIBLE: ("FEASIBLE", True),
            cp_model.INFEASIBLE: ("INFEASIBLE", False),
            cp_model.MODEL_INVALID: ("MODEL_INVALID", False),
            cp_model.UNKNOWN: ("TIMEOUT", False),
        }
        status_str, success = status_map.get(status, ("UNKNOWN", False))

        if not success:
            return OptimizationResult(
                success=False,
                status=status_str,
                message="Không tìm được phương án phân bổ phù hợp.",
                solve_time_ms=solver.WallTime() * 1000,
            )

        # Extract solution
        assignments = []
        for service in self.input.services:
            item_id = service.item_id

            # Tìm staff được assign
            assigned_staff = None
            for (iid, sid), var in self.staff_assignments.items():
                if iid == item_id and solver.Value(var) == 1:
                    assigned_staff = sid
                    break

            # Tìm resource được assign
            assigned_resource = None
            for (iid, rid), var in self.resource_assignments.items():
                if iid == item_id and solver.Value(var) == 1:
                    assigned_resource = rid
                    break

            start_minutes = solver.Value(self.task_starts[item_id])
            end_minutes = solver.Value(self.task_ends[item_id])

            assignments.append({
                "item_id": str(item_id),
                "staff_id": str(assigned_staff) if assigned_staff else None,
                "resource_id": str(assigned_resource) if assigned_resource else None,
                "scheduled_start": _minutes_to_datetime(start_minutes, self.base_time),
                "scheduled_end": _minutes_to_datetime(end_minutes, self.base_time),
            })

        return OptimizationResult(
            success=True,
            status=status_str,
            message="Đã tìm được phương án phân bổ tối ưu.",
            solve_time_ms=solver.WallTime() * 1000,
            assigned_items=assignments,
        )
