"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Search, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Friend {
  id: string
  name: string
  email: string
  picture: string
  pomodoros_today: number
  is_active: boolean
}

interface FriendRequest {
  id: string
  name: string
  email: string
  picture: string
  sent_at: string
}

export function FriendList() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [addFriendOpen, setAddFriendOpen] = useState(false)

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
    
    const mockRequests: FriendRequest[] = [
      {
        id: "r1",
        name: "Emma Wilson",
        email: "emma@example.com",
        picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        sent_at: "2 hours ago"
      },
      {
        id: "r2", 
        name: "John Doe",
        email: "john@example.com",
        picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        sent_at: "1 day ago"
      }
    ]
    
    setFriends(mockFriends)
    setFriendRequests(mockRequests)
    console.log('Friend requests loaded:', mockRequests.length)
  }, [])

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <CardTitle className="text-base">Friends</CardTitle>
          </div>
          <Dialog open={addFriendOpen} onOpenChange={setAddFriendOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <UserPlus className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Friend</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Incoming Friend Requests */}
                {friendRequests.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Incoming Requests ({friendRequests.length})
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {friendRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.picture} alt={request.name} />
                            <AvatarFallback>{request.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {request.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {request.email}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {request.sent_at}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state when no requests */}
                {friendRequests.length === 0 && (
                  <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                    No pending friend requests
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
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

