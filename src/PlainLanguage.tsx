import { useEffect } from 'react'

const replacements: Array<[string, string]> = [
  ['Peer-achievable P75', 'Upper-peer benchmark'],
  ['Gap to P75', 'Gap to upper-peer benchmark'],
  ['Peer median', 'Typical peer participation'],
  ['Median ', 'Typical peer '],
  ['Median', 'Typical peer'],
  [' · P75 ', ' · Upper-peer benchmark '],
  ['P75', 'Upper-peer benchmark'],
  ['observed-to-P75', 'observed-to-upper-peer benchmark'],
  ['peer-achievable P75', 'upper-peer benchmark'],
]

function rewriteText(node: Text) {
  const parent = node.parentElement
  if (!parent || parent.closest('.methodology')) return
  let next = node.nodeValue ?? ''
  for (const [from, to] of replacements) next = next.replaceAll(from, to)
  if (next !== node.nodeValue) node.nodeValue = next
}

function rewrite(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    rewriteText(node as Text)
    node = walker.nextNode()
  }
}

export default function PlainLanguage() {
  useEffect(() => {
    rewrite(document.body)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') rewriteText(mutation.target as Text)
        mutation.addedNodes.forEach((node) => rewrite(node))
      }
    })
    observer.observe(document.body, { subtree: true, childList: true, characterData: true })
    return () => observer.disconnect()
  }, [])
  return null
}
