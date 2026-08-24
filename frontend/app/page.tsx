import AuthDisplay from "@/components/AuthDisplay";


export default function Home() {
  return (
    <div className="flex flex-col w-full h-full items-center justify-center my-6">
      <h1 className="text-3xl font-bold">Auth Journey Project</h1>
      <p className="text-base mb-4">Learn by breaking the things and fixing it yourself</p>
      <AuthDisplay />
    </div>
  );
}
