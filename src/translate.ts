import { Menu, Utils } from "github.com/octarine-public/wrapper/index"

const base = "github.com/octarine-public/show-illusions/scripts_files"
const Load = (name: string) =>
	new Map<string, string>(
		Object.entries(Utils.readJSON(`${base}/translations/${name}.json`))
	)

Menu.Localization.AddLocalizationUnit("russian", Load("ru"))
Menu.Localization.AddLocalizationUnit("english", Load("en"))
Menu.Localization.AddLocalizationUnit("chinese", Load("cn"))
