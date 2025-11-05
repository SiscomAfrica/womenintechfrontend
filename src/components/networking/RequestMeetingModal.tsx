import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useCreateMeetingRequest } from '@/hooks/useMeetings'

interface RequestMeetingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiverId: string
  receiverName: string
}

export function RequestMeetingModal({
  open,
  onOpenChange,
  receiverId,
  receiverName,
}: RequestMeetingModalProps) {
  const createMeeting = useCreateMeetingRequest()
  
  // Form state
  const [proposedDate, setProposedDate] = useState('')
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState('')
  
  // Event dates (Nov 13-14, 2025)
  const eventDates = ['2025-11-13', '2025-11-14']
  
  // Generate hours (1-12) and minutes (00, 15, 30, 45)
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const minutes = ['00', '15', '30', '45']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!proposedDate || !hour || !minute) {
      return
    }

    // Convert 12-hour to 24-hour format
    let hour24 = parseInt(hour)
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0
    }
    
    const proposedTime = `${hour24.toString().padStart(2, '0')}:${minute}`
    const proposedDateTime = new Date(`${proposedDate}T${proposedTime}:00`)
    
    await createMeeting.mutateAsync({
      receiver_id: receiverId,
      proposed_time: proposedDateTime.toISOString(),
      location: location || undefined,
      message: message || undefined,
    })

    // Reset form and close modal
    setProposedDate('')
    setHour('')
    setMinute('')
    setPeriod('AM')
    setLocation('')
    setMessage('')
    onOpenChange(false)
  }

  const handleCancel = () => {
    // Reset form
    setProposedDate('')
    setHour('')
    setMinute('')
    setPeriod('AM')
    setLocation('')
    setMessage('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Meeting with {receiverName}</DialogTitle>
          <DialogDescription>
            Request a 1-on-1 meeting during the event (Nov 13-14, 2025)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Meeting Date *</Label>
            <Select value={proposedDate} onValueChange={setProposedDate} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select event date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025-11-13">November 13, 2025 (Day 1)</SelectItem>
                <SelectItem value="2025-11-14">November 14, 2025 (Day 2)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label>Meeting Time *</Label>
            <div className="grid grid-cols-4 gap-2">
              <Select value={hour} onValueChange={setHour} required>
                <SelectTrigger>
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={minute} onValueChange={setMinute} required>
                <SelectTrigger>
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={period} onValueChange={(val) => setPeriod(val as 'AM' | 'PM')} required>
                <SelectTrigger className="col-span-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location Input */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Coffee Lounge, Conference Room A"
              maxLength={255}
            />
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message about what you'd like to discuss..."
              maxLength={500}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {message.length}/500 characters
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createMeeting.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMeeting.isPending || !proposedDate || !hour || !minute}
              className="bg-[#60166b] hover:bg-[#4a1154]"
            >
              {createMeeting.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
