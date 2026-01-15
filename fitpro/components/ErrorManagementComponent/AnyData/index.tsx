
interface SemDadosProps<T> {
  data: Array<T>;
  nomeDado?: string;
}


export const SemDadosComponent = <T,>({ nomeDado, data }: SemDadosProps<T>) => {

  return (
    <>
    {data.length === 0 && (
      <div className="py-10 text-center text-muted-foreground italic">
        Nenhum {nomeDado} disponível.
      </div>
    )}
    </>
  )
}