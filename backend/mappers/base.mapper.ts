/**
 * Mapper générique pour convertir des entités DB en DTOs
 * @template TEntity - Type de l'entité Prisma (ex: User, Post)
 * @template TDto - Type du DTO de sortie (ex: UserResponseDto)
 */
export abstract class BaseMapper<TEntity, TDto> {

    /**
     * Méthode abstraite à implémenter dans chaque mapper
     * Convertit une entité unique en DTO
     */
    protected abstract mapOne(entity: TEntity): TDto;

    /**
     * Convertit une entité unique en DTO
     * (Wrapper public pour mapOne)
     */
    toDto(entity: TEntity): TDto {
        return this.mapOne(entity);
    }

    /**
     * Convertit un tableau d'entités en tableau de DTOs
     * ✅ Réutilisable pour tous les mappers
     */
    toDtoList(entities: TEntity[]): TDto[] {
        return entities.map(entity => this.mapOne(entity));
    }

    /**
     * Convertit une entité nullable en DTO nullable
     */
    toDtoOrNull(entity: TEntity | null): TDto | null {
        return entity ? this.mapOne(entity) : null;
    }

    /**
     * Filtre les nulls et mappe
     */
    toDtoListFiltered(entities: (TEntity | null)[]): TDto[] {
        return entities
            .filter((entity): entity is TEntity => entity !== null)
            .map(entity => this.mapOne(entity));
    }
}