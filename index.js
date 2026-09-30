import z from '@deepseek-ai/schemastery'

export const Config = z.object({
  sidebarLogo: z.string().default(''),
  sidebarName: z.string().default(''),
  heroLogo: z.string().default(''),
  heroHeadline: z.string().default(''),
  heroBadge: z.string().default(''),
  languageLabel: z.string().default(''),
})

export function apply(ctx, config) {
  ctx.on('webserver/index-inject', (table) => {
    table.push({
      kind: 'global',
      name: '__DSH_BRAND_CUSTOM__',
      value: config,
    })
  })
}