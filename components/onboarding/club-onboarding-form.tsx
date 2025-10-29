"use client"

import { createClient } from "@/lib/supabase/client"
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "../ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"

interface ClubOnboardingFormProps {
  userId: string
}

interface ClubFormData {
  name: string
  email: string
  phone: string
  address: string
}

const ClubOnboardingForm = ({ userId }: ClubOnboardingFormProps) => {
  const [formData, setFormData] = useState<ClubFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
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
      const { data, error } = await supabase
        .from('clubs')
        .insert({
          auth_user_id: userId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          address: formData.address || null,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.log(error)
        setError(error.message)
        console.error('Error al crear el club:', error)
        return
      }

      if (data) {
        console.log('Club creado exitosamente:', data)
        router.push(`/club/${data.id}/${data.name}`)
      }
    } catch (error) {
      setError('Ocurrió un error inesperado')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div>
      <Card className="bg-[#F4EEE0] border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Creá tu Club</CardTitle>
          <CardDescription>
            Configurá tu club de pádel para comenzar a gestionar tus partidos y rankings
          </CardDescription>
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
                <FieldLabel htmlFor="name">Nombre del Club *</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Club de Pádel San Martín"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email del Club *</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="club@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+54 11 1234-5678"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <FieldDescription className="text-xs text-gray-600">
                  Opcional: Teléfono de contacto del club
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="address">Dirección</FieldLabel>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Av. Ejemplo 1234, Buenos Aires"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <FieldDescription className="text-xs text-gray-600">
                  Opcional: Dirección del club
                </FieldDescription>
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="bg-[#393646] w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creando club...' : 'Crear Club y Continuar'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ClubOnboardingForm
