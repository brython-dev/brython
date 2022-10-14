import json

from browser import webcomponent


# issue 1893
class BaseComponent:
    _initialized: bool = False


class UIPlugin:
    @property
    def prefix(self):
        return self._prefix


class TestComponent(UIPlugin, BaseComponent):
    pass


webcomponent.define("ui-test1893", TestComponent)

# issue 1894
class BaseComponent:
    _initialized: bool = False


class UIPlugin:
    def connectedCallback(self):
        try:
            i_dont_exist
            raise Exception('should have raised NameError')
        except NameError:
            pass


class TestComponent(UIPlugin, BaseComponent):
    pass


webcomponent.define("ui-test", TestComponent)

# issue 2062
class BaseElement:
    _initialized: bool = False


class App(BaseElement):

    def connectedCallback(self):
        if not self._initialized:
            self._get_childs()
            self._initialized = True

    def _get_childs(self):
        main_view_elements = []
        for child in self.children:
            main_view_elements.append(child)
        self._main_view_elements = main_view_elements


webcomponent.define("ui-app", App)

# issue 2075
class BaseComponent:
    _initialized: bool = False


class Config(BaseComponent):

    _prefix = "cnf"

    def connectedCallback(self):
        if not self._initialized:
            self.style.display = "none"
            self._initialized = True
        parent = self.parentNode
        child_config = json.loads(self.text)
        selector = self.attrs.get("selector", None)
        assert hasattr(parent, "select")
        if selector:
            for child in parent.select(selector):
                if child.tagName == "UI-CONFIG":
                    continue
                for attr_name, value in child_config.items():
                    setattr(child, attr_name, value)


class Group(BaseComponent):

    _prefix = "grp"

    def connectedCallback(self):
        assert hasattr(self, "select")
        assert hasattr(self, "bind")

        child_config = json.loads(self.attrs.get("child-config", "{}"))
        group_selector = self.attrs.get("selector", None)
        target_selector = self.attrs.get("target", None)

        if target_selector:
            target = self.closest(target_selector)
        else:
            target = self

        if group_selector:
            children = target.querySelectorAll(group_selector)
        else:
            children = target.children
        for child in children:
            for attr_name, value in child_config.items():
                child.attrs[attr_name] = value


webcomponent.define("ui-group", Group)
webcomponent.define("ui-config", Config)