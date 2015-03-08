# ----------------------------------------------------------
import time

from browser import document as doc
from browser import confirm, prompt, alert
from browser.local_storage import storage
import browser.html as html

# ----------------------------------------------------------
SCHEMA_REVISION = "1.0"

STEPS = [
    "TODO" , "SPECIFICATION" , "DESIGN" , "DEVELOPMENT" , "VALIDATION" , "READY"
    ]

STEPS_COLORS = [
    "#777777" , "#888888" , "#999999" , "#AAAAAA" , "#BBBBBB" , "#CCCCCC"
    ]

TASKS_COLORS = [
    "#EE0000" , "#00CC00" , "#0088EE" , "#EEEE00" , "#EEA500"
    ]

TIME_FMT = "%Y/%m/%d %H:%M:%S"

# ----------------------------------------------------------
class KanbanException(Exception):
    def __init__(self, msg):
        Exception.__init__(self, "Kanban Error: %s" % msg)

# ----------------------------------------------------------
class KanbanModel:
    def __init__(self, counter=1, schema_revision=None, steps_colors=None, tasks_colors=None, tasks=None):
        self.schema_revision = schema_revision
        self.counter = int(counter)
        self.steps_colors = list(steps_colors)
        self.tasks_colors = list(tasks_colors)

        if tasks is None:
            root = Task("root", "", "ROOT", 0, 0, [])
            self.tasks = { "root" : root }
        else:
            self.tasks = tasks

    def add_step(self, desc, color_id):
        return self.add_task("root", desc, color_id, 0, prefix="step%d")

    def add_task(self, parent_id, desc, color_id, progress, prefix="task%d"):
        task_id = self.get_next_id(prefix)
        task = Task(task_id, 0, desc, color_id, progress, [])
        self.tasks[task.id] = task

        parent_task = self.tasks[parent_id]
        parent_task.add_task(task)

        return task

    def remove_task(self, task_id):
        task = self.tasks[task_id]
        for sub_task_id in list(task.task_ids):
            self.remove_task(sub_task_id)

        parent_task = self.tasks[task.parent_id]
        del self.tasks[task_id]
        parent_task.remove_task(task)

    def move_task(self, task_id, dst_task_id):
        task = self.tasks[task_id]

        parent_task = self.tasks[task.parent_id]
        parent_task.remove_task(task)

        dst_task = self.tasks[dst_task_id]
        dst_task.add_task(task)

    def get_next_id(self, prefix):
        next_id = prefix % self.counter
        self.counter += 1
        return next_id

# ----------------------------------------------------------
class Task:
    def __init__(self, id=None, parent_id=None, desc=None, color_id=None, progress=None, task_ids=None):
        self.id = id
        self.parent_id = parent_id
        self.desc = desc
        self.color_id = int(color_id)
        self.progress = int(progress)
        self.task_ids = list(task_ids)

    def add_task(self, task):
        self.task_ids.append(task.id)
        task.parent_id = self.id

    def remove_task(self, task):
        self.task_ids.remove(task.id)
        task.parent_id = None

# ----------------------------------------------------------
class KanbanView:
    def __init__(self, kanban):
        self.kanban = kanban
        doc['load_kanban'].bind('click', self.load)
        doc['save_kanban'].bind('click', self.save)
        doc['dump'].bind('click', self.dump)

    def draw(self):
        step_ids = self.kanban.tasks["root"].task_ids
        width = 100 / len(step_ids)

        board = doc["board"]
        clear_node(board)
        for step_id in step_ids:
            step = self.kanban.tasks[step_id]
            self.draw_step(step, width, board)

    def draw_step(self, step, width, board):
        node = html.DIV(id=step.id, Class="step")
        node.style.width = percent(width)
        node.style.backgroundColor = self.kanban.steps_colors[step.color_id]
        board <= node

        header = html.DIV(Class="step_header")
        node <= header

        title = html.PRE(step.desc, Class="step_title")
        header <= title

        count = html.PRE(0, id="%s count" % step.id, Class="step_count")
        count.text = len(step.task_ids)
        header <= count

        node.bind('dragover', self.drag_over)
        node.bind('drop', ev_callback(self.drag_drop, step))

        title.bind('click', ev_callback(self.add_task, step, node))

        self.draw_tasks(step, node)

    def draw_tasks(self, parent_task, parent_node):
        for task_id in parent_task.task_ids:
            task = self.kanban.tasks[task_id]
            self.draw_task(task, parent_node)

    def draw_task(self, task, parent_node):
        node = html.DIV(Class="task", Id=task.id, draggable=True)
        node.style.backgroundColor = self.kanban.tasks_colors[task.color_id]
        parent_node <= node

        progress = html.DIV(Class="task_progress")

        progress_text = html.P("%d%%" % task.progress, Class="task_progress_text")
        progress <= progress_text

        progress_bar = html.DIV(Class="task_progress_bar")
        progress_bar.style.width = percent(task.progress)
        progress <= progress_bar

        command_delete = html.DIV("X", Class="task_command_delete")
        command = html.TABLE( html.TR( html.TD(progress, Class="task_command") + html.TD(command_delete) )
                                , Class="task_command" )
        node <= command

        desc = html.P(Id="desc %s" % task.id, Class="task_desc")
        desc.html = task.desc
        node <= desc

        node.bind('dragstart', ev_callback(self.drag_start, task))
        node.bind('dragover', self.drag_over)
        node.bind('drop', ev_callback(self.drag_drop, task))
        node.bind('click', ev_callback(self.change_task_color, task, node))

        progress.progress_bar = progress_bar
        progress.progress_text = progress_text
        progress.bind('click', ev_callback(self.make_task_progress, task, progress))

        command_delete.bind('click', ev_callback(self.remove_task, task))

        desc.bind('click', ev_callback(self.edit_task, task))

        self.draw_tasks(task, node)

    def set_text(self, task):
        desc = doc["desc %s" % task.id]
        clear_node(desc)
        desc.html = task.desc

    def drag_start(self, ev, task):
        ev.data['text'] = task.id
        ev.data.effectAllowed = 'move'

        ev.stopPropagation()

    def drag_over(self, ev):
        ev.preventDefault()

        ev.data.dropEffect = 'move'

    def drag_drop(self, ev, dst_task):
        ev.preventDefault()
        ev.stopPropagation()

        src_task_id = ev.data['text']
        src_task_node = doc[src_task_id]

        dst_task_id = dst_task.id
        dst_task_node = doc[dst_task_id]

        dst_task_node <= src_task_node
        self.kanban.move_task(src_task_id, dst_task_id)

    def add_task(self, ev, step, node):
        ev.stopPropagation()

        t = time.strftime(TIME_FMT)
        desc = prompt("New task", "%s %s" % (step.desc, t))
        if desc:
            task = self.kanban.add_task(step.id, desc, 0, 0)
            self.draw_task(task, node)

    def remove_task(self, ev, task):
        ev.stopPropagation()

        text = "Confirm deletion of: " + task.desc
        ret = confirm(text)
        if ret:
            del doc[task.id]
            self.kanban.remove_task(task.id)

    def change_task_color(self, ev, task, node):
        ev.stopPropagation()

        task.color_id = ( task.color_id + 1 ) % len(self.kanban.tasks_colors)
        node.style.backgroundColor = self.kanban.tasks_colors[task.color_id]

    def make_task_progress(self, ev, task, node):
        ev.stopPropagation()

        task.progress = ( task.progress + 25 ) % 125

        node.progress_bar.style.width = percent(task.progress)
        node.progress_text.text = percent(task.progress)

    def edit_task(self, ev, task):
        ev.stopPropagation()

        ret = prompt("Task", task.desc)
        if ret:
            task.desc = ret
            self.set_text(task)

    def load(self, *args):
        if "kanban" in storage:
            txt = storage["kanban"]
            try:
                eval("kanban = " + txt)
            except BaseException as e:
                kanban = None

            try:
                if kanban is None:
                    raise KanbanException("could not load data from storage (use 'Save' to initialize it).")

                if kanban.schema_revision != self.kanban.schema_revision:
                    raise KanbanException("storage schema does not match application schema (use 'Save' to re-initialize it)")

                self.kanban = kanban

            except KanbanException as e:
                alert(e.msg)
            
            except:
                del storage["kanban"]

        self.draw()

    def save(self, *args):
        txt = instance_repr(self.kanban)
        storage["kanban"] = txt

    def dump(self, *args):
        code = "storage['kanban'] = " + instance_repr(self.kanban)
        popup_dump(code)

# ----------------------------------------------------------
def clear_node(node):
    for child in list(node):
        node.remove(child)

# ----------------------------------------------------------
def percent(p):
    return ( "%d" % p ) + "%"

# ----------------------------------------------------------
def instance_repr(o):
    if isinstance(o, dict):
        l = []
        for key, value in o.items():
            repr_key = instance_repr(key)
            repr_value = instance_repr(value)
            l.append( "%s : %s" % (repr_key, repr_value) )
        s = "{ %s }" % "\n, ".join(l)

    elif isinstance(o, list):
        l = []
        for i in o:
            repr_i = instance_repr(i)
            l.append(repr_i)
        s = "[ %s ]" % "\n, ".join(l)

    elif isinstance(o, set):
        l = []
        for i in o:
            repr_i = instance_repr(i)
            l.append(repr_i)
        s = "{ %s }" % "\n, ".join(l)

    elif isinstance(o, float):
        s = str(o)

    elif isinstance(o, int):
        s = str(o)

    elif isinstance(o, str):
        s = quoted_escape_string(o)

    else:
        attributes = dir(o)
        l = []
        for n in attributes:
            if not n.startswith("__"):
                repr_key = escape_string(n)
                repr_value = instance_repr( getattr(o, n) )
                l.append( "%s = %s" % (repr_key, repr_value) )
        s = "%s( %s )" % (o.__class__.__name__, ", ".join(l))

    return s

# ----------------------------------------------------------
def quoted_escape_string(s):
    s = "'%s'" % escape_string(s)
    return s

# ----------------------------------------------------------
def escape_string(s):
    # TODO other control characters
    s = s.replace("'", "\\'")
    return s

# ----------------------------------------------------------
def ev_callback(method, *args):
    def cb(ev):
        return method(ev, *args)
    return cb

# ----------------------------------------------------------
def init_demo(kanban):
    for color_id, desc in enumerate(STEPS):
        kanban.add_step(desc, color_id)

    kanban.add_task("step1", 'Project A<br>Add new Feature <b>A3</b>', 0, 0)
    kanban.add_task("step1", 'Project B<br>Add new Feature <b>B2</b>', 0, 0)

    task = kanban.add_task("step2", 'Project B<br>Feature <b>B1</b>', 3, 50)
    kanban.add_task(task.id, 'Check B1.1 with XXX', 4, 75)
    kanban.add_task(task.id, 'Wait for YYY to clarify B1.2', 4, 25)
    kanban.add_task(task.id, 'Started B1.3', 2, 25)

    task = kanban.add_task("step3", 'A1', 3, 75)
    kanban.add_task(task.id, 'Dynamic design', 2, 75)
    kanban.add_task(task.id, 'Static design', 1, 100)

    kanban.add_task("step4", 'A2 Coding', 0, 0)

    task = kanban.add_task("step5", 'Project C', 3, 0)
    kanban.add_task(task.id, 'Waiting QA', 4, 0)

    kanban.add_task("step6", 'Project D', 1, 100)

# ----------------------------------------------------------
kanban = KanbanModel(counter=1, schema_revision=SCHEMA_REVISION, steps_colors=STEPS_COLORS, tasks_colors=TASKS_COLORS)
init_demo(kanban)

kanban_view = KanbanView(kanban)
kanban_view.load()

