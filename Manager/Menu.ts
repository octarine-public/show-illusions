import { Color, Menu } from "github.com/octarine-public/wrapper/wrapper/Imports"
import { IMenu } from "../Drawable/Base"

export default class MenuManager {

	public State: Menu.Toggle
	public ColorCone: Menu.ColorPicker
	public ColorIllusion: Menu.ColorPicker

	public Size: Menu.Slider
	public Opacity: Menu.Slider
	public Distance: Menu.Slider
	public DrawType: Menu.Dropdown
	public HiddenIllusion: Menu.Toggle

	protected Reset: Menu.Button
	protected HiddenIllusionTree: Menu.Node

	constructor() {

		const entry = Menu.AddEntry("Visual")
		const menu = entry.AddNode("Show Illusions", "panorama/images/spellicons/modifier_illusion_png.vtex_c", undefined, 0)

		this.State = menu.AddToggle("State", true)
		this.ColorIllusion = menu.AddColorPicker("Illusion", new Color(0, 0, 160))
		this.ColorCone = menu.AddColorPicker("Clones", new Color(161, 0, 255), "Clones color (e.x Meepo, Vengeful spirit)")

		this.HiddenIllusion = menu.AddToggle("Hide illusions", false)

		this.HiddenIllusionTree = menu.AddNode("Settings", undefined, "Setting up invisible illusions")
		this.Size = this.HiddenIllusionTree.AddSlider("Size", 33, 30, 200)
		this.Opacity = this.HiddenIllusionTree.AddSlider("Opacity", 80, 10, 100)
		this.Distance = this.HiddenIllusionTree.AddSlider("Distance", 1500, 0, 3000, 0, "The distance from you to the illusion\nat which the illusion becomes invisible")
		this.DrawType = this.HiddenIllusionTree.AddDropdown("Draw type", ["Circle", "Images"], 1)

		this.Reset = menu.AddButton("Reset")

		this.Reset.OnValue(() => this.ResetSettings())
		this.HiddenIllusion.OnActivate(() => this.OnActivated())
		this.HiddenIllusion.OnDeactivate(() => this.OnDeactivated())
	}

	public get IMenu(): IMenu {
		return {
			Size: this.Size.value,
			State: this.State.value,
			Type: this.DrawType.selected_id,
			Opacity: this.Opacity.value,
		}
	}

	public OnChangeMenu(callback: () => void) {
		this.Size.OnValue(() => callback())
		this.Reset.OnValue(() => callback())
		this.State.OnValue(() => callback())
		this.Opacity.OnValue(() => callback())
		this.Distance.OnValue(() => callback())
		this.DrawType.OnValue(() => callback())
		this.ColorCone.OnValue(() => callback())
		this.ColorIllusion.OnValue(() => callback())
		this.HiddenIllusion.OnValue(() => callback())
	}

	protected ResetSettings() {
		this.Size.value = 33
		this.State.value = true
		this.Opacity.value = 80
		this.Distance.value = 1500
		this.DrawType.selected_id = 1
		this.HiddenIllusion.value = true
		this.HiddenIllusionTree.IsHidden = false
		this.ColorCone.selected_color.CopyFrom(new Color(161, 0, 255))
		this.ColorIllusion.selected_color.CopyFrom(new Color(0, 0, 160))
	}

	protected OnActivated() {
		this.HiddenIllusionTree.IsHidden = false
	}

	protected OnDeactivated() {
		this.HiddenIllusionTree.IsHidden = true
	}
}
