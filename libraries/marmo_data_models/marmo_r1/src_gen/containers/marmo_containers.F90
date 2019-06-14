module marmo_containers
    use class_marmo_containers_DimensionalScalar, only: DimensionalScalar
    use class_marmo_containers_EquallySpacedSignal, only: EquallySpacedSignal
    use class_marmo_containers_NonEquallySpacedSignal, only: NonEquallySpacedSignal
    use class_marmo_containers_SimpleString, only: SimpleString
    implicit none

    private
    public DimensionalScalar
    public EquallySpacedSignal
    public NonEquallySpacedSignal
    public SimpleString
end module