import { Menu, Utils } from "github.com/octarine-public/wrapper/index"

const base = "github.com/octarine-public/show-illusions"
const Load = (name: string) => {
	return new Map<string, string>
		(Object.entries(Utils.readJSON(`${base}/scripts_files/${name}.json`)))
}

Menu.Localization.AddLocalizationUnit("russian", Load("ru"))
Menu.Localization.AddLocalizationUnit("english", Load("en"))
Menu.Localization.AddLocalizationUnit("chinese", Load("cn"))
