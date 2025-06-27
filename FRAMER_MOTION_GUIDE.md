## 🎯 Como usar o AnimatedCard com Framer Motion

### 1. **Instalação completa** ✅
```bash
yarn add framer-motion
```

### 2. **Componente AnimatedCard criado** ✅
O componente está em `/src/app/components/AnimatedCard.tsx`

### 3. **Como usar no ListCard:**

```tsx
// No arquivo ListCard.tsx
import AnimatedCard from "./AnimatedCard"

export default function ListCard({ list }: ListCardProps) {
  // ...código existente...

  return (
    <AnimatedCard
      isVisible={!isDeleting}
      className="transition-all duration-200"
    >
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
        {/* Conteúdo do card aqui */}
      </div>
    </AnimatedCard>
  )
}
```

### 4. **Para animar uma lista de cards:**

```tsx
// No arquivo page.tsx
import { AnimatedList } from "./components/AnimatedCard"

// Dentro do componente:
<AnimatedList 
  className="space-y-3"
  itemClassName="w-full"
>
  {lists.map((list) => (
    <ListCard key={list.id} list={list} />
  ))}
</AnimatedList>
```

### 5. **Vantagens sobre CSS:**

- ✅ **Baseado em estado**: Anima quando `isDeleting` muda
- ✅ **Sequencial**: Cards aparecem um após o outro
- ✅ **Performático**: Otimizado para React
- ✅ **Mais controle**: Pode pausar, reverter, etc.

### 6. **Animações disponíveis:**

- `slideIn`: opacity 0→1 + translateY 10px→0
- `slideOut`: opacity 1→0 + translateY 0→-10px  
- `delay`: Atraso para animações sequenciais

### 7. **Próximos passos:**

1. Reinicie o TypeScript server no VS Code
2. Importe e use o `AnimatedCard` nos componentes
3. Remova as classes CSS `animate-slide-in/out` se desejar
