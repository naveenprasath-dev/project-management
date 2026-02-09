<?php

namespace App\Http\Controllers;

use App\Models\Space;
use App\Models\TaskStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaskStatusController extends Controller
{
    /**
     * Store a newly created status in storage.
     */
    public function store(Request $request, Space $space)
    {
        if (!$request->user()->canManageSpace($space)) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'color' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'order' => ['integer'],
            'is_final' => ['boolean'],
        ]);

        $space->statuses()->create($validated);

        return back()->with('success', 'Status created successfully.');
    }

    /**
     * Update the specified status in storage.
     */
    public function update(Request $request, Space $space, TaskStatus $status)
    {
        if (!$request->user()->canManageSpace($space)) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'color' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'order' => ['integer'],
            'is_final' => ['boolean'],
        ]);

        $status->update($validated);

        return back()->with('success', 'Status updated successfully.');
    }

    /**
     * Remove the specified status from storage.
     */
    public function destroy(Space $space, TaskStatus $status)
    {
        if (!$this->canDeleteStatus($space, $status)) {
             return back()->with('error', 'Cannot delete status with existing tasks.');
        }

        $status->delete();

        return back()->with('success', 'Status deleted successfully.');
    }

    /**
     * Reorder statuses.
     */
    public function reorder(Request $request, Space $space)
    {
        if (!$request->user()->canManageSpace($space)) {
            abort(403);
        }

        $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:task_statuses,id',
            'orders.*.order' => 'required|integer',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->orders as $item) {
                TaskStatus::where('id', $item['id'])->update(['order' => $item['order']]);
            }
        });

        return back()->with('success', 'Statuses reordered successfully.');
    }

    protected function canDeleteStatus(Space $space, TaskStatus $status): bool
    {
        // Don't allow deleting if tasks exist
        if ($status->tasks()->exists()) {
            return false;
        }

        // Must have at least one status
        if ($space->statuses()->count() <= 1) {
            return false;
        }

        return true;
    }
}
