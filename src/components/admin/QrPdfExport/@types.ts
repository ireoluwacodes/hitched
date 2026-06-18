import type { Id } from "@convex-api/_generated/dataModel"

export interface ITableRow {
  _id: Id<"tables">
  number: number
  label?: string
  qrToken: string
}

export interface IQrPdfExportProps {
  tables: ITableRow[]
}
