"use client";

import type { Skill } from "../types";

interface SkillsTabProps {
  skills: Skill[];
}

export function SkillsTab({ skills }: SkillsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Kỹ năng</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý các kỹ năng mà kỹ thuật viên có thể thực hiện
          </p>
        </div>
        {/* Add button sẽ thêm sau */}
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Chưa có kỹ năng nào. Thêm kỹ năng đầu tiên.
        </div>
      ) : (
        <div className="border rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Tên</th>
                <th className="text-left p-3 font-medium">Mã</th>
                <th className="text-left p-3 font-medium">Mô tả</th>
                <th className="text-right p-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill.id} className="border-b last:border-0">
                  <td className="p-3">{skill.name}</td>
                  <td className="p-3">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {skill.code}
                    </code>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {skill.description || "-"}
                  </td>
                  <td className="p-3 text-right">
                    {/* Actions sẽ thêm sau */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
