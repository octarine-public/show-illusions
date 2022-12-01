import { UnitX } from "github.com/octarine-private/immortal-core/index"

import { BaseDrawable, IMenu } from "./Base"

export const MapDrawable = new Map<any, BaseDrawable>()

export class DrawInteraction {
	public Set(unit: UnitX, Menu: IMenu) {
		const Key = this.KeyName(unit)
		MapDrawable.set(
			Key,
			new BaseDrawable({
				Key,
				Menu,
				IsVisible: unit.IsVisible,
				PlayerColor: unit.PlayerColor,
				Position: () => unit.Position
			})
		)
	}

	public Has(unit: UnitX) {
		const Key = this.KeyName(unit)
		return MapDrawable.has(Key)
	}

	public Delete(unit: UnitX) {
		const Key = this.KeyName(unit)
		return MapDrawable.delete(Key)
	}

	public Update(unit: UnitX, menu?: IMenu) {
		const Key = this.KeyName(unit)
		const getDraw = MapDrawable.get(Key)
		if (getDraw === undefined) {
			return
		}
		if (menu !== undefined) {
			getDraw.OnUpdateMenu(menu)
			return
		}
		getDraw.option.IsVisible = unit.IsVisible
	}

	protected KeyName(unit: UnitX) {
		const name = unit.DefaultName.replace(" ", "_")
		return `${name}_${unit.Handle}`
	}
}
