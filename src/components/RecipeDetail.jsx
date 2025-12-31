import { useState } from 'react';
import { X, Clock, Users, Check, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { saveRecipe, isRecipeSaved } from '../utils/localStorage';

function RecipeDetail({ recipe, userIngredients, onClose }) {
    const [saved, setSaved] = useState(isRecipeSaved(recipe.id));

    const handleSave = () => {
        saveRecipe(recipe);
        setSaved(true);
    };

    const ingredientStatus = recipe.ingredients?.map(ing => ({
        ...ing,
        userHas: userIngredients.some(
            ui => ing.name.toLowerCase().includes(ui.toLowerCase()) ||
                ui.toLowerCase().includes(ing.name.toLowerCase())
        )
    })) || [];

    const matchedCount = ingredientStatus.filter(i => i.userHas).length;
    const totalCount = ingredientStatus.length;
    const missingIngredients = ingredientStatus.filter(i => !i.userHas);

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
            <div
                className="w-full max-w-5xl bg-stone-50 rounded-3xl overflow-hidden shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="grid md:grid-cols-2">
                    {/* Left: Image */}
                    <div className="relative h-64 md:h-auto md:min-h-[600px]">
                        <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <Badge className="absolute top-5 left-5 bg-white/95 text-foreground">{recipe.difficulty}</Badge>
                    </div>

                    {/* Right: Content */}
                    <div className="p-8 md:p-10 space-y-6 overflow-y-auto max-h-[80vh]">
                        {/* Header */}
                        <div>
                            <Badge variant="outline" className="mb-3 text-primary border-primary/30">{recipe.cuisine}</Badge>
                            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight mb-3">{recipe.name}</h1>
                            <p className="text-muted-foreground leading-relaxed">{recipe.description}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 py-5 border-y border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Prep Time</span>
                                    <p className="font-semibold">{Math.round(recipe.cookingTime * 0.3)} min</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Cook Time</span>
                                    <p className="font-semibold">{Math.round(recipe.cookingTime * 0.7)} min</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                                    <Users className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Servings</span>
                                    <p className="font-semibold">{recipe.servings}</p>
                                </div>
                            </div>
                        </div>

                        {/* Ingredients */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-serif text-xl font-semibold">Ingredients</h2>
                                <span className="text-sm text-secondary font-medium">{matchedCount}/{totalCount} in stock</span>
                            </div>
                            <ul className="grid grid-cols-2 gap-3">
                                {ingredientStatus.map((ing, index) => (
                                    <li key={index} className={`flex items-start gap-2 text-sm ${ing.userHas ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${ing.userHas ? 'bg-secondary text-white' : 'bg-muted'}`}>
                                            {ing.userHas ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />}
                                        </span>
                                        <span><strong className="text-foreground">{ing.amount}</strong> {ing.name}</span>
                                    </li>
                                ))}
                            </ul>
                            {missingIngredients.length > 0 && (
                                <div className="flex items-center gap-2 mt-4 p-3 bg-orange-50 text-orange-700 rounded-xl text-sm">
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>{missingIngredients.length} ingredient{missingIngredients.length > 1 ? 's' : ''} to buy</span>
                                </div>
                            )}
                        </div>

                        {/* Preparation */}
                        <div>
                            <h2 className="font-serif text-xl font-semibold mb-4">Preparation</h2>
                            <ol className="space-y-4">
                                {recipe.instructions?.map((step, index) => (
                                    <li key={index} className="flex gap-4">
                                        <span className="w-7 h-7 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                            {index + 1}
                                        </span>
                                        <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{step}</p>
                                    </li>
                                ))}
                            </ol>
                            {recipe.tips && (
                                <div className="flex gap-3 mt-6 p-4 bg-stone-100 rounded-xl border-l-4 border-primary">
                                    <span className="text-2xl">👨‍🍳</span>
                                    <div>
                                        <strong className="text-foreground">Chef's Tip</strong>
                                        <p className="text-sm text-muted-foreground mt-1">{recipe.tips}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Nutrition */}
                        <div>
                            <h2 className="font-serif text-xl font-semibold mb-4">Nutrition <span className="text-sm font-normal text-muted-foreground">per serving</span></h2>
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: 'Calories', value: recipe.calories },
                                    { label: 'Protein', value: recipe.nutritionalInfo?.protein || '—' },
                                    { label: 'Carbs', value: recipe.nutritionalInfo?.carbs || '—' },
                                    { label: 'Fat', value: recipe.nutritionalInfo?.fat || '—' }
                                ].map(item => (
                                    <div key={item.label} className="text-center p-4 bg-muted rounded-xl">
                                        <span className="block text-xl font-bold text-primary">{item.value}</span>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-border">
                            <Button variant="outline" onClick={handleSave} disabled={saved} className="gap-2">
                                <Heart className={saved ? 'fill-red-500 text-red-500' : ''} />
                                {saved ? 'Saved' : 'Save'}
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <Share2 /> Share
                            </Button>
                            <Button className="flex-1" onClick={() => alert('🍳 Happy cooking!')}>
                                Start Cooking
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecipeDetail;
