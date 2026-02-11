namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Space;
use App\Models\Sprint;
use Illuminate\Http\Request;

class SprintController extends Controller
{
    /**
     * Store a newly created sprint.
     */
    public function store(Request $request, Space $space, Project $project)
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'goal' => 'nullable|string',
        ]);

        $project->sprints()->create($validated);

        return back()->with('success', 'Sprint created successfully.');
    }

    /**
     * Update the specified sprint.
     */
    public function update(Request $request, Space $space, Project $project, Sprint $sprint)
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'goal' => 'nullable|string',
            'status' => 'sometimes|required|in:planned,active,completed',
        ]);

        $sprint->update($validated);

        return back()->with('success', 'Sprint updated successfully.');
    }

    /**
     * Remove the specified sprint.
     */
    public function destroy(Space $space, Project $project, Sprint $sprint)
    {
        $this->authorize('update', $project);

        $sprint->delete();

        return back()->with('success', 'Sprint deleted successfully.');
    }

    /**
     * Start the sprint.
     */
    public function start(Request $request, Space $space, Project $project, Sprint $sprint)
    {
        $this->authorize('update', $project);

        // Deactivate any currently active sprints for this project
        $project->sprints()->where('status', 'active')->update(['status' => 'planned']);

        $sprint->update(['status' => 'active', 'start_date' => now()]);

        return back()->with('success', 'Sprint started!');
    }

    /**
     * Complete the sprint.
     */
    public function complete(Request $request, Space $space, Project $project, Sprint $sprint)
    {
        $this->authorize('update', $project);

        $sprint->update(['status' => 'completed', 'end_date' => now()]);

        return back()->with('success', 'Sprint completed!');
    }
}
