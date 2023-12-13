import {
	Color,
	Menu,
	NotificationsSDK,
	ResetSettingsUpdated,
	Sleeper
} from "github.com/octarine-public/wrapper/index"

export class MenuManager {
	public readonly Glow: Menu.Toggle
	public readonly State: Menu.Toggle
	public readonly ColorCone: Menu.ColorPicker
	public readonly ColorIllusion: Menu.ColorPicker
	public readonly sleeper = new Sleeper()

	public readonly Size: Menu.Slider
	public readonly Opacity: Menu.Slider
	public readonly Distance: Menu.Slider
	public readonly DrawType: Menu.Dropdown
	public readonly HiddenIllusion: Menu.Toggle

	protected readonly Reset: Menu.Button
	protected readonly HiddenIllusionTree: Menu.Node

	constructor() {
		const entry = Menu.AddEntry("Visual")
		const menu = entry.AddNode(
			"Show Illusions",
			"panorama/images/spellicons/modifier_illusion_png.vtex_c",
			undefined,
			0
		)

		this.State = menu.AddToggle("State", true)
		this.Glow = menu.AddToggle(
			"Glow effect",
			true,
			"Glow effect useful e.g. on Chaos Knight\nany ill-distinguished illusions"
		)
		this.ColorIllusion = menu.AddColorPicker("Illusion", new Color(0, 0, 160))
		this.ColorCone = menu.AddColorPicker(
			"Clones",
			new Color(161, 0, 255),
			"Clones color (e.x Meepo, Vengeful spirit)"
		)

		this.HiddenIllusion = menu.AddToggle("Hide illusions", false)
		this.HiddenIllusionTree = menu.AddNode(
			"Settings",
			"menu/icons/settings.svg",
			"Setting up invisible illusions"
		)
		this.Size = this.HiddenIllusionTree.AddSlider("Size", 33, 30, 200)
		this.Opacity = this.HiddenIllusionTree.AddSlider("Opacity", 80, 10, 100)
		this.Distance = this.HiddenIllusionTree.AddSlider(
			"Distance",
			1500,
			0,
			3000,
			0,
			"The distance from you to the illusion\nat which the illusion becomes invisible"
		)
		this.DrawType = this.HiddenIllusionTree.AddDropdown(
			"Draw type",
			["Circle", "Images"],
			1
		)

		this.Reset = menu.AddButton("Reset")
		this.HiddenIllusion.OnValue(
			call => (this.HiddenIllusionTree.IsHidden = !call.value)
		)

		this.Reset.OnValue(() => {
			if (this.sleeper.Sleeping("ResetSettings")) {
				return
			}
			this.ResetSettings()
			this.sleeper.Sleep(1000, "ResetSettings")
			NotificationsSDK.Push(new ResetSettingsUpdated())
		})
	}

	public GameChanged() {
		this.sleeper.FullReset()
	}

	protected ResetSettings() {
		this.Glow.value = this.Glow.defaultValue
		this.Size.value = this.Size.defaultValue
		this.State.value = this.State.defaultValue
		this.Opacity.value = this.Opacity.defaultValue
		this.Distance.value = this.Distance.defaultValue
		this.DrawType.SelectedID = this.DrawType.defaultValue
		this.HiddenIllusion.value = this.HiddenIllusion.defaultValue
		this.HiddenIllusionTree.IsHidden = !this.HiddenIllusion.value
		this.ColorCone.SelectedColor.CopyFrom(this.ColorCone.defaultColor)
		this.ColorIllusion.SelectedColor.CopyFrom(this.ColorIllusion.defaultColor)
	}

	public OnChangeMenu(callback: () => void) {
		this.Size.OnValue(() => callback())
		this.Reset.OnValue(() => callback())
		this.Glow.OnValue(() => callback())
		this.State.OnValue(() => callback())
		this.Opacity.OnValue(() => callback())
		this.Distance.OnValue(() => callback())
		this.DrawType.OnValue(() => callback())
		this.ColorCone.OnValue(() => callback())
		this.ColorIllusion.OnValue(() => callback())
		this.HiddenIllusion.OnValue(() => callback())
	}
}
