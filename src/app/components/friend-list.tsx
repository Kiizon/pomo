"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Friend {
  id: string
  name: string
  email: string
  picture: string
  pomodoros_today: number
  is_active: boolean
}

export function FriendList() {
  const [friends, setFriends] = useState<Friend[]>([])

  // Mock data for now - will connect to API later
  useEffect(() => {
    const mockFriends: Friend[] = [
      {
        id: "1",
        name: "Alice Chen",
        email: "alice@example.com",
        picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        pomodoros_today: 8,
        is_active: true
      },
      {
        id: "2", 
        name: "Bob Smith",
        email: "bob@example.com",
        picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
        pomodoros_today: 5,
        is_active: false
      },
      {
        id: "3",
        name: "Carol Lee",
        email: "carol@example.com", 
        picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
        pomodoros_today: 12,
        is_active: true
      },
      {
        id: "4",
        name: "David Park",
        email: "david@example.com",
        picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        pomodoros_today: 3,
        is_active: false
      }
    ]
    setFriends(mockFriends)
  }, [])

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <CardTitle className="text-base">Friends</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <UserPlus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 overflow-y-auto">
        {friends.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
            No friends yet
          </div>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={friend.picture} alt={friend.name} />
                  <AvatarFallback>{friend.name[0]}</AvatarFallback>
                </Avatar>
                {friend.is_active && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                  {friend.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {friend.pomodoros_today} 🍅
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

