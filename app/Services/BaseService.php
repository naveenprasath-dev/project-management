<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

abstract class BaseService
{
    /**
     * @var class-string<Model>
     */
    protected string $model;

    /**
     * Get all records.
     */
    public function all(): Collection
    {
        return $this->model::all();
    }

    /**
     * Get paginated records.
     */
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model::paginate($perPage);
    }

    /**
     * Find a record by ID.
     */
    public function find(int|string $id): ?Model
    {
        return $this->model::find($id);
    }

    /**
     * Create a new record.
     */
    public function create(array $data): Model
    {
        return $this->model::create($data);
    }

    /**
     * Update an existing record.
     */
    public function update(Model $model, array $data): bool
    {
        return $model->update($data);
    }

    /**
     * Delete a record.
     */
    public function delete(Model $model): ?bool
    {
        return $model->delete();
    }
}
