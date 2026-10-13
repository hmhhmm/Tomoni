import { ShoppingBasket, Sprout, ChefHat, Coffee, Footprints, Package } from 'lucide-react'
import type { HelpId } from '../data/types'

export const HELP_ICONS = { groceries: ShoppingBasket, garden: Sprout, cooking: ChefHat, company: Coffee, walks: Footprints, parcels: Package } as const
export const HELP_ORDER: HelpId[] = ['groceries', 'garden', 'cooking', 'company', 'walks', 'parcels']
