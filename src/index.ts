import "./translations"

import {
	Color,
	DOTAGameUIState,
	Entity,
	EventsSDK,
	GameState,
	GUIInfo,
	Hero,
	ImageData,
	LocalPlayer,
	RendererSDK,
	RenderMode,
	SpiritBear,
	Unit,
	Vector2
} from "github.com/octarine-public/wrapper/index"

import { EDrawType } from "./enums"
import { MenuManager } from "./menu"

declare function SetUnitType(customEntityID: number, unitType: number): void

new (class CIllusionsESP {
	private readonly units: Unit[] = []
	private readonly menu = new MenuManager()
	private readonly icon = ImageData.Paths.AbilityIcons + "/modifier_illusion_png.vtex_c"

	constructor() {
		this.menu.OnChangeMenu(() => this.OnChangeMenu())

		EventsSDK.on("Draw", this.Draw.bind(this))
		EventsSDK.on("EntityCreated", this.EntityCreated.bind(this))
		EventsSDK.on("EntityDestroyed", this.EntityDestroyed.bind(this))
		EventsSDK.on("LifeStateChanged", this.LifeStateChanged.bind(this))
		EventsSDK.on("UnitPropertyChanged", this.UnitPropertyChanged.bind(this))
		EventsSDK.on("EntityTeamChanged", this.EntityTeamChanged.bind(this))
	}

	private get state() {
		return this.menu.State.value
	}

	private get canDraw() {
		if (!GameState.IsConnected || !this.state) {
			return false
		}
		if (this.menu.IllusionType.SelectedID !== 1) {
			return false
		}
		return GameState.UIState === DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME
	}

	protected Draw() {
		if (!this.canDraw) {
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
		if (this.CanBeChangeEntity(entity)) {
			this.UpdateUnits(entity)
		}
	}

	protected EntityCreated(entity: Entity) {
		if (this.CanBeChangeEntity(entity)) {
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
		if (this.CanBeChangeEntity(unit)) {
			this.UpdateUnits(unit)
		}
	}

	protected EntityTeamChanged(entity: Entity) {
		if (this.CanBeChangeEntity(entity)) {
			this.UpdateUnits(entity)
		}
	}

	protected UpdateUnits(unit: Unit) {
		const localHero = LocalPlayer?.Hero
		if (localHero === undefined) {
			return
		}

		if (!unit.IsValid || !unit.IsEnemy() || unit.IsHiddenIllusion) {
			unit.CustomGlowColor = undefined
			unit.CustomDrawColor = undefined
			this.units.remove(unit)
			return
		}

		if (
			!this.state ||
			!unit.IsAlive ||
			(unit instanceof SpiritBear && !unit.ShouldRespawn)
		) {
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
			this.setUnitType(unit, true)
			return
		}
		const illusionType = menu.IllusionType.SelectedID
		switch (illusionType) {
			case 1:
			case 2: {
				const isHiddenIllusion = illusionType === 1 && !unit.IsStrongIllusion
				unit.CustomDrawColor = isHiddenIllusion
					? [color, RenderMode.None]
					: [color, RenderMode.TransColor]
				this.setUnitType(unit, illusionType === 2)
				break
			}
			default: {
				unit.CustomDrawColor = [color, RenderMode.TransColor]
				this.setUnitType(unit)
				break
			}
		}
	}

	protected CanBeChangeEntity(entity: Entity): entity is Hero | SpiritBear {
		return (
			(entity instanceof Hero || entity instanceof SpiritBear) &&
			(entity.IsIllusion || entity.IsClone)
		)
	}

	protected OnChangeMenu() {
		for (let index = this.units.length - 1; index > -1; index--) {
			this.UpdateUnits(this.units[index])
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

	private setUnitType(unit: Unit, onlyColor = false) {
		SetUnitType(
			unit.CustomNativeID,
			unit.IsStrongIllusion || unit.IsClone || onlyColor ? 1 : 1152
		)
	}
})()
