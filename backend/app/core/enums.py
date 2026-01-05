from enum import Enum

class UserRole(str, Enum):
    MANAGER = "MANAGER"
    RECEPTIONIST = "RECEPTIONIST"
    TECHNICIAN = "TECHNICIAN"
    CUSTOMER = "CUSTOMER"
