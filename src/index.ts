import "./translations"

import {
	Color,
	DOTAGameUIState,
	Entity,
	EventsSDK,
	GameState,
	GUIInfo,
	Hero,
	LocalPlayer,
	modifierstate,
	PathData,
	RendererSDK,
	RenderMode,
	SpiritBear,
	TaskManager,
	Unit,
	Vector2
} from "github.com/octarine-public/wrapper/index"

import { EDrawType } from "./enums"
import { MenuManager } from "./menu"

declare function SetIllusionClientSide(customEntityID: number, state: boolean): void

new (class CIllusionsESP {
	private readonly units: Unit[] = []
	private readonly menu = new MenuManager()
	private readonly icon = PathData.AbilityImagePath + "/modifier_illusion_png.vtex_c"

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

		const menu = this.menu
		const menuSize = menu.Size.value

		const opacity = (menu.Opacity.value / 100) * 255
		const vectorSize = new Vector2(
			GUIInfo.ScaleWidth(menuSize),
			GUIInfo.ScaleHeight(menuSize)
		)

		for (let index = this.units.length - 1; index > -1; index--) {
			const unit = this.units[index]
			if (!unit.IsAlive || !unit.IsIllusion) {
				continue
			}
			if (!unit.IsVisible || unit.IsStrongIllusion) {
				continue
			}
			const w2s = RendererSDK.WorldToScreen(unit.Position)
			if (w2s === undefined) {
				continue
			}
			const pColor = unit.Color.Clone() // player color
			const position = w2s.Subtract(vectorSize.DivideScalar(2))
			if (menu.DrawType.SelectedID === EDrawType.Images) {
				this.drawImage(position, vectorSize, pColor, menuSize, opacity)
				continue
			}
			this.drawCircle(position, vectorSize, pColor, menuSize, opacity)
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

	private drawImage(
		position: Vector2,
		vecSize: Vector2,
		pColor: Color,
		menuSize = 1,
		opacity = 255
	) {
		RendererSDK.Image(this.icon, position, 0, vecSize, Color.White.SetA(opacity))
		RendererSDK.OutlinedCircle(
			position,
			vecSize,
			pColor.SetA(opacity),
			GUIInfo.ScaleHeight(menuSize) / 15
		)
	}

	private drawCircle(
		position: Vector2,
		vecSize: Vector2,
		pColor: Color,
		menuSize = 1,
		opacity = 255
	) {
		RendererSDK.FilledCircle(position, vecSize, Color.Yellow.SetA(opacity))
		RendererSDK.OutlinedCircle(
			position,
			vecSize,
			pColor.SetA(opacity),
			GUIInfo.ScaleHeight(menuSize) / 15
		)
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
