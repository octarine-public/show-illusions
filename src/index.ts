import "./translations"

import { IllusionGUI } from "./gui"
import { MenuManager } from "./menu"

/** The host's own switch that makes the client draw a unit as an illusion. */
declare function SetIllusionClientSide(customEntityID: number, state: boolean): void

new (class CIllusionsESP {
	private readonly units: Unit[] = []
	private readonly menu = new MenuManager()
	private readonly gui = new IllusionGUI(this.menu)

	constructor() {
		this.menu.OnChangeMenu(() => this.OnChangeMenu())

		EventsSDK.on("Draw", this.Draw.bind(this))
		EventsSDK.on("EntityCreated", this.EntityCreated.bind(this))
		EventsSDK.on("EntityDestroyed", this.EntityDestroyed.bind(this))
		EventsSDK.on("LifeStateChanged", this.LifeStateChanged.bind(this))
		EventsSDK.on("UnitPropertyChanged", this.UnitPropertyChanged.bind(this))
		EventsSDK.on("EntityTeamChanged", this.EntityTeamChanged.bind(this))
		EventsSDK.on("EntityVisibleChanged", this.EntityVisibleChanged.bind(this))
		EventsSDK.on("UnitStateChanged", this.UnitStateChanged.bind(this))
	}

	private get state() {
		return this.menu.State.value
	}

	private get canDraw() {
		return (
			this.menu.IllusionType.SelectedID === 1 &&
			GameState.UIState === DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME
		)
	}

	protected Draw() {
		if (!GameState.IsConnected || !this.state || !this.canDraw) {
			return
		}

		this.gui.BeginFrame()
		for (let index = this.units.length - 1; index > -1; index--) {
			const unit = this.units[index]
			if (!unit.IsValid || !unit.IsAlive || !unit.IsIllusion) {
				continue
			}
			if (!unit.IsVisible || unit.IsStrongIllusion) {
				continue
			}
			this.gui.Draw(unit)
		}
	}

	protected LifeStateChanged(entity: Entity) {
		if (this.canBeUpdateEntity(entity)) {
			this.UpdateUnits(entity)
		}
	}

	protected EntityCreated(entity: Entity) {
		if (this.canBeUpdateEntity(entity)) {
			this.units.push(entity)
			this.UpdateUnits(entity)
		}
	}

	protected EntityDestroyed(entity: Entity) {
		if (entity instanceof Unit) {
			this.UpdateUnits(entity)
			this.units.remove(entity)
		}
	}

	protected UnitPropertyChanged(unit: Unit) {
		if (this.canBeUpdateEntity(unit)) {
			this.UpdateUnits(unit)
		}
	}

	protected EntityTeamChanged(entity: Entity) {
		if (this.canBeUpdateEntity(entity)) {
			this.UpdateUnits(entity)
		}
	}

	protected EntityVisibleChanged(entity: Entity) {
		if (!entity.IsVisible) {
			return
		}
		if (this.canBeUpdateEntity(entity)) {
			this.UpdateUnits(entity)
		}
	}

	protected UnitStateChanged(unit: Unit) {
		if (this.canBeUpdateEntity(unit)) {
			this.UpdateUnits(unit)
		}
	}

	protected UpdateUnits(unit: Unit) {
		const localHero = LocalPlayer?.Hero
		if (localHero === undefined || !this.isValidUnitState(unit)) {
			return
		}
		if (this.canBeRemove(unit)) {
			unit.CustomGlowColor = undefined
			unit.CustomDrawColor = undefined
			this.units.remove(unit)
			return
		}
		if (!this.state || (unit instanceof SpiritBear && !unit.ShouldRespawn)) {
			unit.CustomGlowColor = undefined
			unit.CustomDrawColor = undefined
			return
		}

		const menu = this.menu
		const color = unit.IsIllusion
			? menu.Color.SelectedColor
			: menu.ColorClone.SelectedColor

		unit.CustomGlowColor = menu.Glow.value ? color : undefined

		if (unit.IsClone && !unit.IsIllusion) {
			unit.CustomDrawColor = [color, RenderMode.TransColor]
			this.setClientIllusion(unit, false)
			return
		}
		const illusionType = menu.IllusionType.SelectedID
		switch (illusionType) {
			case 1: {
				const isSuperIllusion = unit.IsStrongIllusion || unit.IsClone
				this.setClientIllusion(unit, !isSuperIllusion)
				unit.CustomDrawColor = !isSuperIllusion
					? [color, RenderMode.None]
					: [color, RenderMode.TransColor]
				break
			}
			default: {
				unit.CustomDrawColor = [color, RenderMode.TransColor]
				this.setClientIllusion(unit, true)
				break
			}
		}
	}

	protected OnChangeMenu() {
		for (let i = this.units.length - 1; i > -1; i--) {
			this.UpdateUnits(this.units[i])
		}
	}

	private setClientIllusion(unit: Unit, state: boolean) {
		TaskManager.Begin(() => {
			if (unit.IsStrongIllusion || unit.IsClone) {
				return
			}
			if (this.isValidUnitState(unit)) {
				SetIllusionClientSide(unit.CustomNativeID, state)
			}
		})
	}

	private canBeRemove(unit: Unit) {
		return !unit.IsValid || !unit.IsEnemy() || (!unit.IsIllusion && !unit.IsClone)
	}

	private canBeUpdateEntity(entity: Entity): entity is Hero | SpiritBear {
		if (!(entity instanceof Unit)) {
			return false
		}
		return (
			(entity.IsHero || entity.IsSpiritBear) &&
			(entity.IsIllusion || entity.IsClone)
		)
	}
	private isValidUnitState(unit: Unit) {
		if (!unit.IsValid || !unit.IsAlive || unit.IsInvulnerable) {
			return false
		}
		return (
			!unit.IsUnitStateFlagSet(modifierstate.MODIFIER_STATE_UNSELECTABLE) &&
			!unit.IsUnitStateFlagSet(modifierstate.MODIFIER_STATE_OUT_OF_GAME)
		)
	}
})()
