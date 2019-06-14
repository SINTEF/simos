module marmo_basic
    use class_marmo_basic_NamedEntity, only: NamedEntity
    use class_marmo_basic_NamedEntityWithUnit, only: NamedEntityWithUnit
    implicit none

    private
    public NamedEntity
    public NamedEntityWithUnit
end module