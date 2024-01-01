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
	RendererSDK,
	RenderMode,
	SpiritBear,
	Unit,
	Vector2
} from "github.com/octarine-public/wrapper/index"

import { MenuManager } from "./menu"

const bootstrap = new (class CIllusions {
	private readonly units: Unit[] = []
	private readonly menu = new MenuManager()

	constructor() {
		this.menu.OnChangeMenu(() => this.OnChangeMenu())
	}

	private get state() {
		return this.menu.State.value
	}

	public Draw() {
		if (!this.state || !this.menu.HiddenIllusion.value) {
			return
		}
		if (!GameState.IsConnected || !this.units.length) {
			return
		}
		if (GameState.UIState !== DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME) {
			return
		}

		const menu = this.menu
		const size = menu.Size.value
		const opacity = (menu.Opacity.value / 100) * 255
		const vectorSize = new Vector2(
			GUIInfo.ScaleWidth(size),
			GUIInfo.ScaleHeight(size)
		)

		for (let index = this.units.length - 1; index > -1; index--) {
			const unit = this.units[index]
			if (!unit.IsAlive || !unit.IsIllusion || !unit.IsVisible) {
				continue
			}

			const w2s = RendererSDK.WorldToScreen(unit.Position)
			if (w2s === undefined) {
				continue
			}

			const pColor = unit.Color.Clone()
			const position = w2s.Subtract(vectorSize.DivideScalar(2))

			if (menu.DrawType.SelectedID === 1) {
				const image = "panorama/images/spellicons/modifier_illusion_png.vtex_c"
				RendererSDK.Image(
					image,
					position,
					0,
					vectorSize,
					Color.White.SetA(opacity)
				)
				RendererSDK.OutlinedCircle(
					position,
					vectorSize,
					pColor.SetA(opacity),
					GUIInfo.ScaleHeight(size) / 15
				)
				continue
			}

			RendererSDK.FilledCircle(position, vectorSize, Color.Yellow.SetA(opacity))
			RendererSDK.OutlinedCircle(
				position,
				vectorSize,
				unit.Color.Clone().SetA(opacity),
				GUIInfo.ScaleHeight(size) / 15
			)
		}
	}

	public LifeStateChanged(entity: Entity) {
		if (this.CanBeChangeEntity(entity)) {
			this.UpdateUnits(entity)
		}
	}

	public EntityCreated(entity: Entity) {
		if (this.CanBeChangeEntity(entity)) {
			this.units.push(entity)
			this.UpdateUnits(entity)
		}
	}

	public EntityDestroyed(entity: Entity) {
		if (entity instanceof Unit && this.units.remove(entity)) {
			this.UpdateUnits(entity)
		}
	}

	public GameChanged() {
		this.menu.GameChanged()
	}

	public UnitPropertyChanged(unit: Unit) {
		if (this.CanBeChangeEntity(unit)) {
			this.UpdateUnits(unit)
		}
	}

	public EntityTeamChanged(entity: Entity) {
		if (this.CanBeChangeEntity(entity)) {
			this.UpdateUnits(entity)
		}
	}

	protected UpdateUnits(unit: Unit) {
		const localHero = LocalPlayer?.Hero
		if (localHero === undefined || !unit.IsEnemy()) {
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
		const maxDistance = menu.Distance.value
		const hiddenIllusion = menu.HiddenIllusion.value
		const color = unit.IsIllusion
			? menu.ColorIllusion.SelectedColor
			: menu.ColorCone.SelectedColor

		unit.CustomGlowColor = menu.Glow.value ? color : undefined

		if (unit.IsClone && !unit.IsIllusion) {
			unit.CustomDrawColor = [color, RenderMode.TransColor]
			return
		}

		unit.CustomDrawColor = hiddenIllusion
			? [
					color,
					localHero.Distance(unit) <= maxDistance
						? RenderMode.None
						: RenderMode.Normal
				]
			: [color, RenderMode.TransColor]
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
})()

EventsSDK.on("Draw", () => bootstrap.Draw())

EventsSDK.on("GameEnded", () => bootstrap.GameChanged())

EventsSDK.on("GameStarted", () => bootstrap.GameChanged())

EventsSDK.on("EntityCreated", entity => bootstrap.EntityCreated(entity))

EventsSDK.on("EntityDestroyed", entity => bootstrap.EntityDestroyed(entity))

EventsSDK.on("LifeStateChanged", entity => bootstrap.LifeStateChanged(entity))

EventsSDK.on("UnitPropertyChanged", unit => bootstrap.UnitPropertyChanged(unit))

EventsSDK.on("EntityTeamChanged", entity => bootstrap.EntityTeamChanged(entity))
