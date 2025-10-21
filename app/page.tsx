import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Link href={"/auth/login"}>
        Iniciar Sesión
      </Link>
      <Link href={"/auth/register"}>
        Registro
      </Link>
    </>
  );
}
