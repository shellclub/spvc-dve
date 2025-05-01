
"use client"
import React from 'react'
import CardBox from '../../shared/CardBox'
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/app/components/shadcn-ui/Default-Ui/button"
import { Calendar } from "@/app/components/shadcn-ui/Default-Ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/app/components/shadcn-ui/Default-Ui/popover"
import { th } from 'date-fns/locale'
type Props = {
    value?: Date
    onChange?: (date: Date) => void
}
const formatThaiDate = (date: Date) => {
    const buddhistYear = date.getFullYear() + 543
    const formatted = format(date, "d MMMM yyyy", { locale: th })
    // แทนปี ค.ศ. ด้วย พ.ศ.
    return formatted.replace(date.getFullYear().toString(), buddhistYear.toString())
}
const BasicDatepicker = ({ value, onChange }: Props) => {
    return (

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal group",
                                !value && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4 text-primary group-hover:text-white" />
                            {value ? formatThaiDate(value) : <span className='text-primary group-hover:text-white' >เลือก ว/ด/ป เกิด</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={value}
                            
                            onSelect={(date) => {
                                if (onChange && date) onChange(date);
                                
                            }}
                            locale={th}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
    )
}

export default BasicDatepicker