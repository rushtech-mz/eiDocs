/**
 * 🎨 DESIGN SYSTEM - RUSH TECH
 * 
 * Cores extraídas do logo oficial da Rush Tech
 * Logo: Degradê azul (#1E90FF) para roxo (#9D4EDD)
 */

export const colors = {
    // ===== CORES PRIMÁRIAS (do logo) =====
    primary: {
      blue: '#16A34A',      // Verde primário
      purple: '#059669',    // Esmeralda (fim do degradê)
      dark: '#0A1628',      // Fundo escuro
    },
  
    // ===== CORES NEUTRAS =====
    neutral: {
      white: '#FFFFFF',
      gray: {
        50: '#F8FAFC',      // Cinza muito claro (backgrounds)
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',     // Cinza médio (textos secundários)
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',     // Cinza escuro (textos)
        900: '#0F172A',
      }
    },
  
    // ===== CORES DE ESTADO =====
    state: {
      success: '#10B981',   // Verde (sucesso)
      error: '#EF4444',     // Vermelho (erro)
      warning: '#F59E0B',   // Amarelo (aviso)
      info: '#06B6D4',      // Ciano (informação)
    },
  
    // ===== GRADIENTES =====
    gradients: {
      // Gradiente principal (verde → esmeralda)
      primary: 'linear-gradient(135deg, #16A34A 0%, #059669 100%)',

      // Gradiente invertido (esmeralda → verde)
      primaryReverse: 'linear-gradient(135deg, #059669 0%, #16A34A 100%)',

      // Gradiente sutil para backgrounds
      subtle: 'linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
      
      // Gradiente escuro para hero sections
      dark: 'linear-gradient(135deg, #0A1628 0%, #1E293B 100%)',
    },
  
    // ===== BACKGROUNDS =====
    background: {
      light: '#F8FAFC',     // Fundo claro padrão
      dark: '#0A1628',      // Fundo escuro (como no logo)
      card: '#FFFFFF',      // Fundo de cards
    },
  
    // ===== TEXTOS =====
    text: {
      primary: '#0F172A',   // Texto principal (escuro)
      secondary: '#64748B', // Texto secundário (cinza)
      tertiary: '#94A3B8',  // Texto terciário (cinza claro)
      inverse: '#FFFFFF',   // Texto sobre fundo escuro
    }
  } as const;
  
  // ===== EXPORT INDIVIDUAL (para facilitar imports) =====
  export const {
    primary,
    neutral,
    state,
    gradients,
    background,
    text
  } = colors;
  
  /**
   * 💡 COMO USAR:
   * 
   * // Import nomeado
   * import { primary, gradients } from '@/styles/colors';
   * 
   * // Uso em componentes
   * <div style={{ background: gradients.primary }}>
   *   <h1 style={{ color: primary.blue }}>Rush Tech</h1>
   * </div>
   * 
   * // Uso com Tailwind (depois de configurar)
   * <div className="bg-primary-blue text-white">
   *   Rush Tech
   * </div>
   */