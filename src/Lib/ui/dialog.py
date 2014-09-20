from . import widget
from browser import html, document

class Dialog(widget.DraggableWidget):
  def __init__(self, id=None):
      self._div_shell=html.DIV(
         Class="ui-dialog ui-widget ui-widget-content ui-corner-all ui-front ui-draggable ui-resizable",
         style={'position': 'absolute', 'height': 'auto', 'width': '300px',
                'top': '98px', 'left': '140px', 'display': 'block'})

      widget.DraggableWidget.__init__(self, self._div_shell, 'dialog', id)

      _div_titlebar=html.DIV(Id="titlebar",
           Class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix")
      self._div_shell <= _div_titlebar

      self._div_title=html.SPAN(Id="title", Class="ui-dialog-title")
        
      _div_titlebar <= self._div_title

      self._title_button=html.BUTTON(Title="close",
            Class="ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only ui-dialog-titlebar-close")

      def dialog_close(e):
          #del document[self._div_shell.id]
          del document[self._div_shell.id]

      self._title_button.bind('click', dialog_close)
      _span=html.SPAN(Class="ui-button-icon-primary ui-icon ui-icon-closethick")
      self._title_button <= _span

      _span=html.SPAN('close', Class="ui-button-text")
      self._title_button <= _span

      _div_titlebar <= self._title_button

      self._div_dialog=html.DIV(Class="ui-dialog-content ui-widget-content",
           style={'width': 'auto', 'min-height': '105px', 
                  'max-height': 'none', 'height': 'auto'})

      self._div_shell <= self._div_dialog

      for _i in ['n', 'e', 's', 'w', 'se', 'sw', 'ne', 'nw']:
          if _i == 'se':
             _class="ui-resizable-handle ui-resizable-%s ui-icon ui-icon-gripsmall-diagonal-%s" % (_i, _i)
          else:
             _class="ui-resizable-handle ui-resizable-%s" % _i

          self._div_shell <= html.DIV(Class=_class, style={'z-index': '90'})

      document <= self._div_shell

  def set_title(self, title):
      self._div_title.set_text(title)

  def set_body(self, body):
      self._div_dialog.set_html(body)

class EntryDialog(Dialog):

    def __init__(self, title, prompt, action, _id=None):
        Dialog.__init__(self, _id)
        self.set_title(title)
        self.action = action
        d_prompt = html.DIV(prompt, Class="ui-widget", 
            style=dict(float="left",paddingRight="10px"))
        self.entry = html.INPUT()
        body = html.DIV(d_prompt+self.entry,
            style={'padding':'15px'})
        b_ok = html.BUTTON("Ok")
        b_ok.bind('click', self.ok)
        b_cancel = html.BUTTON("Cancel")
        b_cancel.bind('click', self.cancel)
        body += html.DIV(b_ok+b_cancel, style={'padding':'15px'})
        self._div_dialog <= body
    
    def ok(self, ev):
        self.result = self._div_shell.get(selector='INPUT')[0].value
        self.action(self.result)
        document.remove(self._div_shell)

    def cancel(self, ev):
        document.remove(self._div_shell)

class SelectDialog(Dialog):

    def __init__(self, title, prompt, options, action, _id=None):
        Dialog.__init__(self, _id)
        self.set_title(title)
        self.options = options
        self.action = action
        d_prompt = html.DIV(prompt, Class="ui-widget", 
            style=dict(float="left",paddingRight="10px"))
        self.select = html.SELECT()
        for option in options:
            self.select <= html.OPTION(option)
        body = html.DIV(d_prompt+self.select,
            style={'padding':'15px'})
        b_ok = html.BUTTON("Ok")
        b_ok.bind('click', self.ok)
        b_cancel = html.BUTTON("Cancel")
        b_cancel.bind('click', self.cancel)
        body += html.DIV(b_ok+b_cancel, style={'padding':'15px'})
        self._div_dialog <= body
    
    def ok(self, ev):
        ix = self._div_shell.get(selector='SELECT')[0].selectedIndex
        document.remove(self._div_shell)
        self.action(self.options[ix])

    def cancel(self, ev):
        document.remove(self._div_shell)

class YesNoDialog(Dialog):

    def __init__(self, title, prompt, action_if_yes, action_if_no, _id=None):
        Dialog.__init__(self, _id)
        self.set_title(title)
        
        self.action_if_yes = action_if_yes
        self.action_if_no = action_if_no
        
        d_prompt = html.DIV(prompt, Class="ui-widget", 
            style=dict(float="left",paddingRight="10px"))
        body = html.DIV(d_prompt, style={'padding':'15px'})
        b_ok = html.BUTTON("Yes")
        b_ok.bind('click', self.yes)
        b_cancel = html.BUTTON("No")
        b_cancel.bind('click', self.no)
        body += html.DIV(b_ok+b_cancel, style={'padding':'15px'})
        self._div_dialog <= body
    
    def yes(self, ev):
        document.remove(self._div_shell)
        self.action_if_yes(self)

    def no(self, ev):
        document.remove(self._div_shell)
        if self.action_if_no is not None:
            self.action_if_no(self)
