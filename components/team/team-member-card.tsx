"use client"

import { useState } from "react"
import { Trash2, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { User } from "@/types"
import { apiDelete } from "@/lib/api-client"

interface TeamMemberCardProps {
  member: User
  onRemove: (memberId: string) => void
}

export default function TeamMemberCard({ member, onRemove }: TeamMemberCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleRemove = async () => {
    if (confirm("Are you sure you want to remove this team member?")) {
      try {
        setIsDeleting(true)
        await apiDelete(`/team/${member._id}`)
        onRemove(member._id)
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to remove team member")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {member.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>
          <button
            onClick={handleRemove}
            disabled={isDeleting}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <h3 className="font-semibold text-white">{member.name}</h3>
        <div className="flex items-center gap-2 text-sm text-slate-400 mt-2">
          <Mail size={14} />
          <span>{member.email}</span>
        </div>

        <div className="mt-3 text-xs text-slate-500">Joined {new Date(member.createdAt).toLocaleDateString()}</div>
      </CardContent>
    </Card>
  )
}
