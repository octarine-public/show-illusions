import { EntityX, HeroX, RuneX, UnitX } from "github.com/octarine-private/immortal-core/Imports"
import { ArrayExtensions, DOTAGameUIState_t, GameState, LifeState_t, RenderMode_t } from "github.com/octarine-public/wrapper/wrapper/Imports"
import DrawInteraction, { MapDrawable } from "../Drawable/Index"
import MenuManager from "./Menu"

export default class IllusionsManager {

	protected Illusion: HeroX[] = []
	protected MyHero: Nullable<HeroX>
	protected DrawInteraction: DrawInteraction

	constructor(protected menu: MenuManager) {

		this.DrawInteraction = new DrawInteraction()
		this.menu.OnChangeMenu(() => this.OnChangeMenu())
	}

	public OnDraw() {

		if (!this.menu.HiddenIllusion.value || !GameState.IsConnected
			|| GameState.UIState !== DOTAGameUIState_t.DOTA_GAME_UI_DOTA_INGAME)
			return

		for (const [, data] of MapDrawable)
			data.OnDraw()
	}

	public OnPostDataUpdate() {

		if (!GameState.IsConnected)
			return

		const myHero = this.MyHero
		if (myHero === undefined)
			return

		const Distance = this.menu.Distance.value
		const Color = this.menu.ColorIllusion.selected_color
		const ClonesColor = this.menu.ColorCone.selected_color
		const HiddenIllusion = this.menu.HiddenIllusion.value

		for (const Illusion of this.Illusion) {

			if (Illusion.IsClone) {
				Illusion.CustomDrawColor = [ClonesColor, RenderMode_t.kRenderTransColor]
				continue
			}

			if (HiddenIllusion) {

				if (myHero.Distance(Illusion) <= Distance) {
					if (!this.DrawInteraction.Has(Illusion) && Illusion)
						this.DrawInteraction.Set(Illusion, this.menu.IMenu)
					Illusion.CustomDrawColor = [Color, RenderMode_t.kRenderNone]
					continue
				}

				if (this.DrawInteraction.Has(Illusion))
					this.DrawInteraction.Delete(Illusion)
			}

			Illusion.CustomDrawColor = !Illusion.IsClone
				? [Color, RenderMode_t.kRenderTransColor]
				: [ClonesColor, RenderMode_t.kRenderTransColor]
		}
	}

	public OnVisibilityChanged(unit: UnitX | RuneX) {
		if (!(unit instanceof HeroX) || !this.IsValid(unit))
			return
		this.DrawInteraction.Update(unit)
	}

	public OnLifeStateChanged(entity: EntityX) {
		if (!(entity instanceof HeroX) || !this.IsValid(entity))
			return
		switch (entity.LifeState) {
			case LifeState_t.LIFE_DEAD:
				this.DrawInteraction.Delete(entity)
				ArrayExtensions.arrayRemove(this.Illusion, entity)
				break
		}
	}

	public OnEntityCreated(entity: EntityX) {
		if (!(entity instanceof HeroX) || this.HasHero(entity))
			return
		if (!entity.IsEnemy() && entity.IsMyHero) {
			this.MyHero = entity
			return
		}
		if (this.IsValid(entity))
			this.Illusion.push(entity)
	}

	public OnEntityChanged(entity: EntityX) {

		if (!(entity instanceof HeroX))
			return

		if (!this.IsValid(entity) || !entity.IsAlive) {
			this.DrawInteraction.Delete(entity)
			ArrayExtensions.arrayRemove(this.Illusion, entity)
			return
		}

		if (!this.HasHero(entity))
			this.Illusion.push(entity)
	}

	public OnEntityDestroyed(entity: EntityX) {
		if (!(entity instanceof HeroX))
			return
		if (entity.IsImportant && this.MyHero?.Equals(entity)) {
			this.MyHero = undefined
			return
		}
		this.DrawInteraction.Delete(entity)
		ArrayExtensions.arrayRemove(this.Illusion, entity)
	}

	public OnGameEnded() {
		MapDrawable.clear()
	}

	protected OnChangeMenu() {
		for (const Illusion of this.Illusion)
			this.DrawInteraction.Update(Illusion, this.menu.IMenu)
	}

	protected HasHero(hero: HeroX) {
		return this.Illusion.some(x => x.Equals(hero))
	}

	protected IsValid(unit: UnitX) {
		return unit.IsEnemy() && (unit.IsClone || unit.IsIllusion)
	}
}
