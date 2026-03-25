import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-red-500">
      <main className="rounded-2xl bg-white p-10 shadow-xl">
        <h1 className="text-4xl font-extrabold underline text-blue-600">
          Tailwind funciona
        </h1>

        <p className="mt-4 text-lg text-gray-700">
          Si ves fondo rojo, tarjeta blanca, texto azul grande y subrayado,
          Tailwind está funcionando.
        </p>

        <div className="mt-6 rounded-lg bg-black px-4 py-3 text-white">
          Caja de prueba con Tailwind
        </div>
      </main>
    </div>
  );
}