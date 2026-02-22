<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * List current user's notifications.
     */
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->paginate(20);

        return response()->json($notifications);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json(['status' => 'ok']);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()
            ->unreadNotifications
            ->markAsRead();

        return response()->json(['status' => 'ok']);
    }

    /**
     * Get unread count.
     */
    public function unreadCount(Request $request)
    {
        return response()->json([
            'count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * Delete a specific notification.
     */
    public function destroy(Request $request, string $id): \Illuminate\Http\JsonResponse
    {
        $request->user()
            ->notifications()
            ->findOrFail($id)
            ->delete();

        return response()->json(['status' => 'ok']);
    }

    /**
     * Delete all notifications for the current user.
     */
    public function clearAll(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->user()->notifications()->delete();

        return response()->json(['status' => 'ok']);
    }
}
