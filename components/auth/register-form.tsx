"use client"

import { createClient } from "@/lib/supabase/client"
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "../ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "../ui/field"
import { Input } from "../ui/input"
import { IUserCredential } from "@/types/user.type"


const RegisterForm = () => {
    const [credentials, setCredentials] = useState<IUserCredential>({
        email: "",
        password: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const supabase = createClient()

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase.auth.signUp({
                email: credentials.email,
                password: credentials.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/confirmed`,
                }
            })

            if (error) {
                setError(error.message)
                console.error('Error al registrarse:', error)
                return
            }

            if (data.user) {
                console.log('Usuario registrado exitosamente:', data.user)
               
                if (data.session) {
                
                    router.push('/onboarding/club')
                } else {
                    router.push('/auth/confirm')
                }
            }
        } catch (error) {
            setError('Ocurrió un error inesperado')
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials(prev => ({
            ...prev,
            email: e.target.value
        }))
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials(prev => ({
            ...prev,
            password: e.target.value
        }))
    }

    return (
    <div>
      <Card className="bg-[#F4EEE0] border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Registrate y llevá tu pádel al siguiente nivel.</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-lg" role="alert">
                  {error}
                </div>
              )}

              <Field>
                <Button variant="outline" type="button" disabled={isLoading}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Iniciar sesión con Google
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card bg-[#F4EEE0]">
                O continua con
              </FieldSeparator>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={credentials.email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  className="border-[#4F4557]"
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <FieldDescription className="text-xs text-gray-600">
                  Mínimo 8 caracteres
                </FieldDescription>
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="bg-[#393646] w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registrando...' : 'Registrarse'}
                </Button>
                <FieldDescription className="text-center">
                  ¿Ya tenés cuenta? <a href="/login" className="underline">Iniciar Sesión</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#" className="underline">Terms of Service</a>{" "}
        and <a href="#" className="underline">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}

export default RegisterForm;