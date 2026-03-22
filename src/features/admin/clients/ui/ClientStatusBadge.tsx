"use client"

interface ClientStatusBadgeProps {
    status: "ACTIVE" | "AT_RISK" | "INACTIVE"
    lastContactDate?: Date | string | null
    nextFollowupDate?: Date | string | null
    showDetails?: boolean
}

const statusConfig = {
    ACTIVE: {
        label: "Active Contact",
        color: "bg-green-500/20 text-green-700 dark:text-green-400",
        dotColor: "bg-green-500",
    },
    AT_RISK: {
        label: "At Risk",
        color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
        dotColor: "bg-yellow-500",
    },
    INACTIVE: {
        label: "Inactive",
        color: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
        dotColor: "bg-gray-500",
    }
}

export default function ClientStatusBadge({
    status,
    lastContactDate,
    nextFollowupDate,
    showDetails = false
}: ClientStatusBadgeProps) {
    const config = statusConfig[status]

    const getDaysSinceLastContact = () => {
        if (!lastContactDate) return null
        const last = new Date(lastContactDate)
        const days = Math.floor((new Date().getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
        return days
    }

    const getDaysUntilFollowup = () => {
        if (!nextFollowupDate) return null
        const next = new Date(nextFollowupDate)
        const days = Math.floor((next.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return days
    }

    const daysSince = getDaysSinceLastContact()
    const daysUntil = getDaysUntilFollowup()

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
                    {config.label}
                </span>

                {showDetails && daysSince !== null && daysSince >= 0 && (
                    <span className="text-xs text-gray-500">
                        {daysSince === 0 ? "Today" : `${daysSince} days ago`}
                    </span>
                )}
            </div>

            {showDetails && daysUntil !== null && daysUntil > 0 && (
                <div className="text-xs text-gray-500">
                    Follow-up: {daysUntil === 0 ? "Today" : `in ${daysUntil} days`}
                </div>
            )}

            {showDetails && daysUntil !== null && daysUntil < 0 && (
                <div className="text-xs text-red-500">
                    ⚠️ Follow-up overdue by {Math.abs(daysUntil)} days
                </div>
            )}
        </div>
    )
}