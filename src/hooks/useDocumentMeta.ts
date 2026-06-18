import { useEffect } from "react"

export interface IDocumentMetaOptions {
  title: string
  description?: string
  imageUrl?: string
}

function setMetaTag(name: string, content: string, attribute: "name" | "property" = "name") {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`)
  if (!element) {
    element = document.createElement("meta")
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }
  element.content = content
}

export function useDocumentMeta({ title, description, imageUrl }: IDocumentMetaOptions) {
  useEffect(() => {
    document.title = title
  }, [title])

  useEffect(() => {
    if (!description) return
    setMetaTag("description", description)
    setMetaTag("og:title", title, "property")
    setMetaTag("og:description", description, "property")
    setMetaTag("twitter:title", title)
    setMetaTag("twitter:description", description)
  }, [title, description])

  useEffect(() => {
    if (!imageUrl) return
    setMetaTag("og:image", imageUrl, "property")
    setMetaTag("twitter:image", imageUrl)
  }, [imageUrl])
}
