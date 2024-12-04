import { zAccess, zAccessFeeType, zCommercialUse, zDerivations, zLicenseFeeCurrency, zLicenseType, zUdlInputSchema } from "../types/udl"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCallback, useEffect, useState } from "react"
import { RotateCcw } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface Props {
  onSubmit: (values: z.infer<typeof zUdlInputSchema>) => void
  initialValues?: Partial<z.infer<typeof zUdlInputSchema>>
}

export function formatTagHuman(str: string) {
    return str
      .split("-")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  }

const defaultValues: z.infer<typeof zUdlInputSchema> = {
  Access: "Unspecified",
  "Access Fee Type": "One-Time",
  "Access Fee Value": "",
  Derivations: "Unspecified",
  "Commercial Use": "Unspecified",
  "License Type": "Unspecified",
  "License Fee Value": "",
  "License Fee Currency": "$U",
  "Revenue Share Percentage": "",
  Expires: "",
  "Payment Address": "",
  // "Payment Mode": 'Unspecified',
}

export const UdlForm = (props: Props) => {
  const { onSubmit, initialValues } = props

  const form = useForm<z.infer<typeof zUdlInputSchema>>({
    resolver: zodResolver(zUdlInputSchema),
    defaultValues: {
      ...defaultValues,
      ...initialValues,
    },
  })

  const [isRevenueShare, setIsRevenueShare] = useState(false)
  const [isLicense, setIsLicense] = useState(false)
  const [isAccessRestricted, setIsAccessRestricted] = useState(false)

  const setup = useCallback((value: Partial<z.infer<typeof zUdlInputSchema>>) => {
    value["Derivations"] === 'Allowed-With-RevenueShare' ? setIsRevenueShare(true) : setIsRevenueShare(false)
    value["License Type"] !== "Unspecified" ? setIsLicense(true) : setIsLicense(false)
    value["Access"] === "restricted" ? setIsAccessRestricted(true) : setIsAccessRestricted(false)
  }, [])

  useEffect(() => {
    setup(form.getValues())
  }, [form, setup]);

  form.watch((value) => setup(value))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderSelect = (field: any, title: string, description: string, options: string[], firstOption?: string) => {
    return (
      <FormItem>
        <FormLabel>{title}</FormLabel>
        <Select onValueChange={field.onChange} value={field.value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectContent />
              { 
                firstOption && <SelectItem key={firstOption} value={firstOption}>{firstOption}</SelectItem>
              }
              {
                options.map((option) => {
                  return <SelectItem key={option} value={option}>{formatTagHuman(option)}</SelectItem>
                })
              }
          </SelectContent>
        </Select>
        <FormDescription>
          {description}
        </FormDescription>
        <FormMessage />
      </FormItem>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col px-2 py-4 gap-4">
          <div className={`flex flex-col md:flex-row gap-4 ${isRevenueShare ? 'h-60 md:h-32' : 'h-32'} transition-all duration-200`}>
            <FormField
              control={form.control}
              name={"Derivations"}
              render={({ field }) => renderSelect(field, 'Derivations', 'Rights to make derivative works', zDerivations.options, 'Unspecified')}
            />
            <div className={`${isRevenueShare ? 'md:w-[45%] h-30 opacity-100' : 'h-0 opacity-0 translate-x-full overflow-hidden'} transition-all duration-200`}>
              <FormField
                control={form.control}
                name={"Revenue Share Percentage"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue Share Percentage</FormLabel>
                    <FormControl>
                      <div className="flex flex-row items-center">
                        <Input placeholder="10" {...field} />
                        <span className="pl-2">%</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Revenue from derivations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Separator />
          <FormField
            control={form.control}
            name={"Access"}
            render={({ field }) => renderSelect(field, 'Access Mode', 'License for accessing the content', zAccess.options, 'Unspecified')}
          />
          <div className={`flex flex-col sm:flex-row gap-4 ${isAccessRestricted ? 'w-full h-60 sm:h-32 opacity-100' : 'w-0 h-0 opacity-0 overflow-hidden'} transition-all duration-200`}>
            <FormField
              control={form.control}
              name={"Access Fee Type"}
              render={({ field }) => renderSelect(field, 'Access Fee Type', 'Required payment terms for accessing the content', zAccessFeeType.options)}
            />
            <FormField
              control={form.control}
              name={"Access Fee Value"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Fee Value</FormLabel>
                  <FormControl>
                    <Input placeholder="0.1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Value required for access ($U)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator />
          <FormField
            control={form.control}
            name={"Commercial Use"}
            render={({ field }) => renderSelect(field, 'Commercial Use', 'Terms required for commercial use', zCommercialUse.options, 'Unspecified')}
          />
          <FormField
            control={form.control}
            name={"License Type"}
            render={({ field }) => renderSelect(field, 'License Type', 'Required payment terms for licensing the content', zLicenseType.options, 'Unspecified')}
          />
          <div className={`flex flex-col sm:flex-row gap-4 ${isLicense ? 'h-60 sm:h-32 opacity-100' : 'h-0 opacity-0 overflow-hidden'} transition-all duration-200`}>
            <FormField
              control={form.control}
              name={"License Fee Currency"}
              render={({ field }) => renderSelect(field, 'License Fee Currency', 'Type of currency required', zLicenseFeeCurrency.options, '$U')}
            />
            <FormField
              control={form.control}
              name={"License Fee Value"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Fee Value</FormLabel>
                  <FormControl>
                    <Input placeholder="0.1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Value of currency required
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={`${isRevenueShare || isLicense ? 'md:h-30 opacity-100' : 'h-0 opacity-0 overflow-hidden'} transition-all duration-200`}>
            <Separator />
            <FormField
              control={form.control}
              name={"Payment Address"}
              render={({ field }) => (
                <FormItem className="py-4">
                  <FormLabel>Payment Address</FormLabel>
                  <FormControl>
                    <Input placeholder={"vLRHFq..."} {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional, uses your wallet address if not specified.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name={"Payment Mode"}
              render={({ field }) => renderSelect(field, 'Payment Mode', '<description>', zPaymentMode.options, 'Unspecified')}
            /> */}
          </div>
          <Separator />
          <FormField
            control={form.control}
            name={"Expires"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry (years)</FormLabel>
                <FormControl>
                  <Input placeholder="5" {...field} />
                </FormControl>
                <FormDescription>
                  Number of years until the license expires (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-8 flex flex-row justify-between items-center gap-4">
            <Button
              size={"icon"}
              className="invisible"
            />
            <Button
              type="submit"
              variant={"default"}
              size={"lg"}
            >
              Save
            </Button>
            <Button
              onClick={() => form.reset()}
              disabled={!form.formState.isDirty}
              variant={"destructive"}
              size={"icon"}
              aria-description="Reset form"
            >
              <RotateCcw size={20} />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
