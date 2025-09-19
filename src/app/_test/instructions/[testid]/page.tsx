import Instructions from "../../components/instructions"

const InstructionsPage = async ({
  params,
}: {
  params: Promise<{ testid: string }>
}) => {
  const { testid } = await params

  return (
    <main className="">
      <Instructions testId = {testid}/>
    </main>
  )
}

export default InstructionsPage
