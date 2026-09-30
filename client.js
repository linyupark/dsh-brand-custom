window.__ModuleLoader__.load({
  id: 'dsh-brand-custom',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const CONFIG_KEY = '__DSH_BRAND_CUSTOM__'
    const CONVERSATION_NS = 'conversation'
    const VARIANT_SUFFIX = '-x-dsh-brand'
    const OCCUPANT_PRIORITY = -1000
    const STYLE_TEXT = [
      '.dsh-brand-custom-mark{display:inline-flex;align-items:center;justify-content:center;color:inherit}',
      '.dsh-brand-custom-mark>svg{display:block;width:100%;height:100%}',
      '.dsh-brand-custom-mark>img{display:block;width:100%;height:100%;object-fit:contain}',
      '.dsh-brand-custom-glyph{display:block;line-height:1;font-family:inherit}',
      '.dsh-brand-custom-name{display:inline-flex;align-items:center;min-width:0;max-width:200px;overflow:hidden;white-space:nowrap;letter-spacing:.04em}',
    ].join('')

    const SVG_SOURCE = /^\s*</u
    const URL_SOURCE = /^(?:https?:|data:|blob:|\/)/u

    function text(value) {
      return typeof value === 'string' ? value : ''
    }

    function config() {
      const raw = globalThis[CONFIG_KEY]
      return raw !== null && typeof raw === 'object' ? raw : {}
    }

    function sizeOf(props, fallback) {
      return typeof props?.size === 'number' ? props.size : fallback
    }

    function Mark({ source, size }) {
      if (SVG_SOURCE.test(source)) {
        return h('span', {
          className: 'dsh-brand-custom-mark',
          style: { width: size, height: size },
          'aria-hidden': true,
          dangerouslySetInnerHTML: { __html: source },
        })
      }
      if (URL_SOURCE.test(source)) {
        return h('span', {
          className: 'dsh-brand-custom-mark',
          style: { width: size, height: size },
          'aria-hidden': true,
        }, h('img', { src: source, alt: '' }))
      }
      return h('span', {
        className: 'dsh-brand-custom-mark',
        style: { width: size, height: size },
        'aria-hidden': true,
      }, h('span', { className: 'dsh-brand-custom-glyph', style: { fontSize: size } }, source))
    }

    function occupy(ctx, slot, component) {
      ctx.slots.inject(slot, () => ctx.slots.register(
        { name: slot, priority: OCCUPANT_PRIORITY },
        component,
      ))
    }

    function overrideHeroText(ctx, cfg) {
      const dict = {}
      const headline = text(cfg.heroHeadline)
      const badge = text(cfg.heroBadge)
      if (headline !== '') dict['hero.headline'] = headline
      if (badge !== '') dict['hero.preview'] = badge
      if (Object.keys(dict).length === 0) return

      ctx.effect(() => {
        const locale = ctx.locale
        const snapshot = locale.getLocale()
        const active = text(snapshot.active)
        const base = active.endsWith(VARIANT_SUFFIX) ? active.slice(0, -VARIANT_SUFFIX.length) : active
        const variant = `${base}${VARIANT_SUFFIX}`
        if (snapshot.locales.some((entry) => entry.id === variant)) {
          locale.setLocale(variant)
          return () => {}
        }
        const owner = snapshot.locales.find((entry) => entry.id === base)
        const label = text(cfg.languageLabel) !== '' ? text(cfg.languageLabel) : `${owner?.label ?? base} (自定义)`
        const offLanguage = locale.addLanguage({ id: variant, label, fallback: base })
        const offDict = locale.register(CONVERSATION_NS, variant, dict)
        locale.setLocale(variant)
        return () => {
          offDict()
          offLanguage()
        }
      })
    }

    function apply(ctx) {
      const cfg = config()

      ctx.effect(() => {
        const style = document.createElement('style')
        style.dataset.pluginCss = 'dsh-brand-custom'
        style.textContent = STYLE_TEXT
        document.head.appendChild(style)
        return () => {
          style.remove()
        }
      })

      const heroLogo = text(cfg.heroLogo)
      if (heroLogo !== '') {
        occupy(ctx, 'conversation.hero.brand.mark', (props) => h(Mark, { source: heroLogo, size: sizeOf(props, 34) }))
      }

      const sidebarLogo = text(cfg.sidebarLogo)
      if (sidebarLogo !== '') {
        occupy(ctx, 'sidebar.brand.mark', (props) => h(Mark, { source: sidebarLogo, size: sizeOf(props, 24) }))
      }

      const sidebarName = text(cfg.sidebarName)
      if (sidebarName !== '') {
        occupy(ctx, 'sidebar.brand.name', () => h('span', { className: 'dsh-brand-custom-name' }, sidebarName))
      }

      overrideHeroText(ctx, cfg)
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    }
  },
})