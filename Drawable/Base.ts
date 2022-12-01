import { Color, GUIInfo, RendererSDK, Vector2, Vector3 } from "github.com/octarine-public/wrapper/index"

import { DrawTypeIllusion } from "../Enum/DrawType"

export interface IMenu {
	State: boolean
	Size: number
	Opacity: number
	Type: DrawTypeIllusion
}

export interface IBaseDrawable {
	Key: any
	Menu: IMenu
	IsVisible: boolean
	PlayerColor: Color
	Position: () => Vector3
}

export class BaseDrawable {
	constructor(public readonly option: IBaseDrawable) {}

	public get Position() {
		return this.option.Position()
	}

	public get Menu() {
		return this.option.Menu
	}

	public get PlayerColor() {
		return this.option.PlayerColor
	}

	public get IsVisible() {
		return this.option.IsVisible
	}

	public OnDraw() {
		if (!this.Menu.State || !this.IsVisible) {
			return
		}

		const w2sPosition = RendererSDK.WorldToScreen(this.Position)
		if (w2sPosition === undefined) {
			return
		}

		const Size = this.Menu.Size
		const Opacity = (this.Menu.Opacity / 100) * 255
		const vectorSize = new Vector2(GUIInfo.ScaleWidth(Size), GUIInfo.ScaleWidth(Size))

		const position = w2sPosition.Subtract(vectorSize.DivideScalar(2))

		if (this.Menu.Type === DrawTypeIllusion.IMAGES) {
			RendererSDK.Image(
				"panorama/images/spellicons/modifier_illusion_png.vtex_c",
				position,
				0,
				vectorSize,
				Color.White.SetA(Opacity)
			)
			RendererSDK.OutlinedCircle(
				position,
				vectorSize,
				this.PlayerColor.SetA(Opacity),
				GUIInfo.ScaleHeight(Size) / 15
			)
			return
		}

		RendererSDK.FilledCircle(position, vectorSize, Color.Yellow.SetA(Opacity))
		RendererSDK.OutlinedCircle(position, vectorSize, this.PlayerColor.SetA(Opacity), GUIInfo.ScaleHeight(Size) / 15)
	}

	public OnUpdateMenu(menu: IMenu) {
		this.option.Menu = menu
	}
}
