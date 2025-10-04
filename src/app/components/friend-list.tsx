"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Search, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

interface Friend {
  id: string
  name: string | null
  email: string
  picture: string | null
  pomodoros_today: number
}

interface FriendRequest {
  id: string
  sender: {
    id: string
    name: string | null
    email: string
    picture: string | null
  }
  status: string
  created_at: string
}

interface SearchResult {
  id: string
  name: string | null
  email: string
  picture: string | null
}

export function FriendList() {
  const { user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [addFriendOpen, setAddFriendOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const loadFriends = useCallback(async () => {
    try {
      const data = await apiClient.getFriends()
      setFriends(data)
    } catch (error) {
      console.error('Failed to load friends:', error)
    }
  }, [])

  const loadFriendRequests = useCallback(async () => {
    try {
      const data = await apiClient.getIncomingRequests()
      setFriendRequests(data)
    } catch (error) {
      console.error('Failed to load friend requests:', error)
    }
  }, [])

  const searchUsers = useCallback(async () => {
    setSearchLoading(true)
    try {
      const data = await apiClient.searchUsers(searchQuery)
      setSearchResults(data)
    } catch (error) {
      console.error('Failed to search users:', error)
      toast.error('Failed to search users')
    } finally {
      setSearchLoading(false)
    }
  }, [searchQuery])

  // Load friends and requests
  useEffect(() => {
    if (user) {
      loadFriends()
      loadFriendRequests()
    }
  }, [user, loadFriends, loadFriendRequests])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3) {
        searchUsers()
      } else {
        setSearchResults([])
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, searchUsers])

  async function handleSendRequest(email: string) {
    setLoading(true)
    try {
      await apiClient.sendFriendRequest(email)
      toast.success('Friend request sent!')
      setSearchQuery('')
      setSearchResults([])
    } catch (error: any) {
      console.error('Failed to send friend request:', error)
      const status = error?.status
      const errorMessage = error?.message || ''
      
      if (status === 404 || errorMessage.toLowerCase().includes('not found')) {
        toast.error('User does not exist')
      } else if (status === 400) {
        // Parse the specific 400 error message
        if (errorMessage.toLowerCase().includes('already friends')) {
          toast.error('Already friends with this user')
        } else if (errorMessage.toLowerCase().includes('yourself')) {
          toast.error('Cannot send friend request to yourself')
        } else if (errorMessage.toLowerCase().includes('already exists')) {
          toast.error('Friend request already sent')
        } else {
          toast.error(errorMessage)
        }
      } else {
        toast.error('Failed to send friend request')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSearchEnter() {
    if (!searchQuery.trim()) return
    
    // Try to send request directly with the email
    await handleSendRequest(searchQuery.trim())
  }

  async function handleAccept(requestId: string) {
    setLoading(true)
    try {
      await apiClient.acceptFriendRequest(requestId)
      toast.success('Friend request accepted!')
      await loadFriends()
      await loadFriendRequests()
    } catch (error) {
      console.error('Failed to accept friend request:', error)
      toast.error('Failed to accept request')
    } finally {
      setLoading(false)
    }
  }

  async function handleReject(requestId: string) {
    setLoading(true)
    try {
      await apiClient.rejectFriendRequest(requestId)
      toast.success('Friend request rejected')
      await loadFriendRequests()
    } catch (error) {
      console.error('Failed to reject friend request:', error)
      toast.error('Failed to reject request')
    } finally {
      setLoading(false)
    }
  }

  function formatTimeAgo(dateString: string) {
    const isoString = dateString.endsWith('Z') ? dateString : `${dateString}Z`
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }

  if (!user) {
    return null
  }

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
                    placeholder="Search by email... (press Enter to send request)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSearchEnter()
                      }
                    }}
                    className="pl-10"
                    disabled={loading}
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Search Results
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.picture || undefined} alt={user.name || user.email} />
                            <AvatarFallback>{(user.name || user.email)[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user.name || 'No name'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSendRequest(user.email)}
                            disabled={loading}
                            className="h-8"
                          >
                            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                            <AvatarImage src={request.sender.picture || undefined} alt={request.sender.name || request.sender.email} />
                            <AvatarFallback>{(request.sender.name || request.sender.email)[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {request.sender.name || 'No name'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {request.sender.email}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {formatTimeAgo(request.created_at)}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                              onClick={() => handleAccept(request.id)}
                              disabled={loading}
                            >
                              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => handleReject(request.id)}
                              disabled={loading}
                            >
                              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state when no requests and no search */}
                {friendRequests.length === 0 && searchResults.length === 0 && searchQuery.length < 3 && (
                  <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery.length > 0 && searchQuery.length < 3
                      ? 'Type at least 3 characters to search'
                      : 'No pending friend requests'}
                  </div>
                )}

                {/* No search results */}
                {searchQuery.length >= 3 && searchResults.length === 0 && !searchLoading && (
                  <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                    No users found
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
            No friends yet. Add friends to see their progress!
          </div>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={friend.picture || undefined} alt={friend.name || friend.email} />
                <AvatarFallback>{(friend.name || friend.email)[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                  {friend.name || friend.email}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {friend.pomodoros_today} 🍅 today
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

