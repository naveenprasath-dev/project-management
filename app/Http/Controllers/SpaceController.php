<?php

namespace App\Http\Controllers;

use App\Http\Requests\Spaces\StoreSpaceRequest;
use App\Http\Requests\Spaces\UpdateSpaceRequest;
use App\Models\Space;
use App\Services\SpaceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Gate;

class SpaceController extends Controller
{
    public function __construct(
        protected SpaceService $spaceService
    ) {}

    /**
     * Display a listing of spaces.
     */
    public function index(Request $request): Response
    {
        $spaces = $request->user()->isAdmin() 
            ? Space::with('creator')->get()
            : $request->user()->spaces()->with('creator')->get();

        return Inertia::render('spaces/index', [
            'spaces' => $spaces
        ]);
    }

    /**
     * Show the form for creating a new space.
     */
    public function create(): Response
    {
        return Inertia::render('spaces/create');
    }

    /**
     * Store a newly created space.
     */
    public function store(StoreSpaceRequest $request)
    {
        if (!$request->user()->can('create spaces')) {
            abort(403);
        }

        $space = $this->spaceService->createWithDefaults(
            $request->validated(),
            $request->user()
        );

        return redirect()->route('spaces.show', $space->slug)
            ->with('success', 'Space created successfully.');
    }

    /**
     * Display the specified space.
     */
    public function show(Space $space, Request $request): Response
    {
        if (!$request->user()->hasSpaceAccess($space->id)) {
            abort(403);
        }

        $space->load(['members', 'statuses', 'tasks.assignees', 'tasks.status']);

        // Use centralized analytics from the model
        $space->analytics = $space->getAnalytics();
        $space->projects = $space->getProjectsWithAnalytics();

        return Inertia::render('spaces/show', [
            'space' => $space
        ]);
    }

    /**
     * Show the form for editing the specified space.
     */
    public function edit(Space $space, Request $request): Response
    {
        if (!$request->user()->canManageSpace($space)) {
            abort(403);
        }

        return Inertia::render('spaces/settings', [
            'space' => $space->load(['statuses', 'members', 'projects' => function($query) {
                $query->withCount('tasks');
            }])
        ]);
    }

    /**
     * Update the specified space.
     */
    public function update(UpdateSpaceRequest $request, Space $space)
    {
        if (!$request->user()->canManageSpace($space)) {
            abort(403);
        }

        $this->spaceService->update($space, $request->validated());

        return back()->with('success', 'Space updated successfully.');
    }

    /**
     * Remove the specified space.
     */
    public function destroy(Space $space, Request $request)
    {
        if (!$request->user()->canDeleteSpace($space)) {
            abort(403);
        }

        $this->spaceService->delete($space);

        return redirect()->route('spaces.index')
            ->with('success', 'Space deleted successfully.');
    }
}
