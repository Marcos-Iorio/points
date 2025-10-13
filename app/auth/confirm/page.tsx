import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function ConfirmEmailPage() {
  return (
    <div className="flex min-h-screen bg-[#121A3F] flex-col items-center justify-center py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <Card className="bg-[#F4EEE0] border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verificá tu email</CardTitle>
            <CardDescription className="text-base">
              Te enviamos un correo para que confirmes tu dirección de email.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                Revisá tu bandeja de entrada y hacé click en el link de confirmación.
              </p>
              <p className="text-sm text-gray-700 mt-2 font-semibold">
                No te olvides de chequear la carpeta de SPAM 📧
              </p>
            </div>
            <p className="text-xs text-gray-600">
              Una vez confirmado, podrás iniciar sesión y crear tu club.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}