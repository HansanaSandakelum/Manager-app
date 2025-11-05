"use client"

import { useEffect, useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { apiGet } from "@/lib/api-client"
import type { User } from "@/types"
import InviteTeamMemberModal from "@/components/team/invite-team-member-modal"
import TeamMemberCard from "@/components/team/team-member-card"

export default function TeamPage() {
  const [members, setMembers] = useState<User[]>([])
  const [filteredMembers, setFilteredMembers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMembers(members)
    } else {
      setFilteredMembers(
        members.filter(
          (m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    }
  }, [members, searchQuery])

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true)
      const data = await apiGet<User[]>("/team")
      setMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch team members")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMemberAdded = (newMember: User) => {
    setMembers([...members, newMember])
    setShowModal(false)
  }

  const handleMemberRemoved = (memberId: string) => {
    setMembers(members.filter((m) => m._id !== memberId))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Team Members</h1>
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus size={20} className="mr-2" />
          Invite Member
        </Button>
      </div>

      {error && (
        <Card className="bg-red-500/10 border-red-500/50">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <Input
          type="text"
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-slate-600 bg-slate-800 text-white placeholder:text-slate-500"
        />
      </div>

      {isLoading ? (
        <div className="text-slate-400">Loading team members...</div>
      ) : filteredMembers.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-400 mb-4">
              {members.length === 0
                ? "No team members yet. Invite your first team member."
                : "No members match your search."}
            </p>
            {members.length === 0 && (
              <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                Invite First Member
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <TeamMemberCard key={member._id} member={member} onRemove={handleMemberRemoved} />
          ))}
        </div>
      )}

      {showModal && <InviteTeamMemberModal onClose={() => setShowModal(false)} onSuccess={handleMemberAdded} />}
    </div>
  )
}
