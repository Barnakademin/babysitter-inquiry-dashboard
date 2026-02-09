// postcss.config.js
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import remToPx from 'postcss-rem-to-pixel'

// 🔧 Локальный PostCSS-плагин, добавляющий !important ко всем декларациям
const addImportant = () => ({
  postcssPlugin: 'add-important',
  Declaration(decl) {
    if (!decl.important) decl.important = true
  },
})
addImportant.postcss = true

export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
    remToPx({
      rootValue: 16, // Базовый размер для конвертации rem в px (16px = 1rem)
      propList: ['*'],
      replace: true,
      mediaQuery: true,
      minPixelValue: 0 // Конвертируем все rem значения, даже очень маленькие
    }),

    addImportant(),
  ],
}
