import { useState, useEffect } from 'react';
import { Box, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Grid, Typography, Menu } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Add as AddIcon } from '@mui/icons-material';
import { useAgendaStore } from '../../stores/useAgendaStore';
import { DateTimePicker } from '@mui/x-date-pickers';
import { startOfDay } from 'date-fns';

interface TaskFormData {
  title: string;
  date: Date;
  isAllDay: boolean;
  startTime?: Date;
  endTime?: Date;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatUntil?: Date;
}

export function AgendaPage() {
  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [taskForm, setTaskForm] = useState<TaskFormData>({
    title: '',
    date: new Date(),
    isAllDay: false,
    repeat: 'none',
  });

  const { loadTasks, addTask, updateTask, removeTask, getTasksByDate } = useAgendaStore();
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; taskId: string } | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleTaskFormSubmit = async () => {
    const taskDate = startOfDay(taskForm.date);
    const taskData = {
      title: taskForm.title,
      date: taskDate.toISOString(),
      is_all_day: taskForm.isAllDay,
      start_time: taskForm.startTime?.toISOString(),
      end_time: taskForm.endTime?.toISOString(),
      repeat_type: taskForm.repeat,
      repeat_until: taskForm.repeatUntil?.toISOString(),
    };

    if (editingTask) {
      await updateTask(editingTask, taskData);
      setEditingTask(null);
    } else {
      await addTask(taskData);
    }

    setOpenTaskForm(false);
    setTaskForm({
      title: '',
      date: new Date(),
      isAllDay: false,
      repeat: 'none',
    });
  };

  const handleContextMenu = (event: React.MouseEvent, taskId: string) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            taskId,
          }
        : null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleEdit = () => {
    const task = getTasksByDate(selectedDate).find(t => t.id === contextMenu?.taskId);
    if (task) {
      setTaskForm({
        title: task.title,
        date: new Date(task.date),
        isAllDay: task.is_all_day,
        startTime: task.start_time ? new Date(task.start_time) : undefined,
        endTime: task.end_time ? new Date(task.end_time) : undefined,
        repeat: task.repeat_type,
        repeatUntil: task.repeat_until ? new Date(task.repeat_until) : undefined,
      });
      setEditingTask(task.id);
      setOpenTaskForm(true);
    }
    handleClose();
  };

  const handleDelete = async () => {
    if (contextMenu?.taskId) {
      await removeTask(contextMenu.taskId);
    }
    handleClose();
  };

  return (
    <Box sx={{ 
      width: '48vh', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        p: 3, 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2,
        position: 'sticky',
        top: 0,
        backgroundColor: 'background.default',
        zIndex: 1
      }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenTaskForm(true)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Nova Tarefa
        </Button>

        <Paper
          sx={{
            p: 3,
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DateCalendar
              value={selectedDate}
              onChange={(newDate) => newDate && setSelectedDate(newDate)}
              disableHighlightToday={false}
              sx={{
                width: '100%',
                '& .MuiPickersDay-today': {
                  backgroundColor: '#ff9800',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#f57c00',
                  },
                },
                '& .MuiPickersDay-root.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Paper>
      </Box>

      <Paper
        sx={{
          p: 3,
          flex: 1,
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          overflow: 'auto',
          minHeight: 0
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {getTasksByDate(selectedDate).map((task) => (
            <Paper
              key={task.id}
              onContextMenu={(e) => handleContextMenu(e, task.id)}
              sx={{
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                cursor: 'context-menu',
                '&:hover': {
                  backgroundColor: '#eeeeee',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                  {task.title}
                </Typography>
                {!task.is_all_day && task.start_time && (
                  <Typography variant="body2" color="text.secondary">
                    {new Date(task.start_time).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {task.end_time && ` - ${new Date(task.end_time).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`}
                  </Typography>
                )}
              </Box>
              {task.repeat_type !== 'none' && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Repete: {{
                    daily: 'Diariamente',
                    weekly: 'Semanalmente',
                    monthly: 'Mensalmente',
                    yearly: 'Anualmente',
                  }[task.repeat_type]}
                  {task.repeat_until && ` até ${new Date(task.repeat_until).toLocaleDateString('pt-BR')}`}
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      </Paper>

      <Dialog
        open={openTaskForm}
        onClose={() => setOpenTaskForm(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: '#FFFFFF',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #f0f0f0' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Nova Tarefa
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}>
            <TextField
              fullWidth
              label="Título"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8f9fa',
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                  },
                },
              }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label="Data"
                  value={taskForm.date}
                  onChange={(newDate) => newDate && setTaskForm({ ...taskForm, date: newDate })}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8f9fa',
                      '&:hover': {
                        backgroundColor: '#f3f4f6',
                      },
                    },
                  }}
                />
              </LocalizationProvider>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={taskForm.isAllDay}
                    onChange={(e) => setTaskForm({ ...taskForm, isAllDay: e.target.checked })}
                    sx={{
                      color: 'primary.main',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                }
                label={<Typography sx={{ fontWeight: 500 }}>Dia todo</Typography>}
                sx={{ ml: 0 }}
              />
            </Box>

            {!taskForm.isAllDay && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <TimePicker
                      label="Hora de início"
                      value={taskForm.startTime || null}
                      onChange={(newTime) => setTaskForm({ ...taskForm, startTime: newTime || undefined })}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#f8f9fa',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <TimePicker
                      label="Hora de término"
                      value={taskForm.endTime || null}
                      onChange={(newTime) => setTaskForm({ ...taskForm, endTime: newTime || undefined })}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#f8f9fa',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Repetir</InputLabel>
                <Select
                  value={taskForm.repeat}
                  label="Repetir"
                  onChange={(e) => setTaskForm({ ...taskForm, repeat: e.target.value as TaskFormData['repeat'] })}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#f8f9fa',
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                    },
                  }}
                >
                  <MenuItem value="none">Não repetir</MenuItem>
                  <MenuItem value="daily">Diariamente</MenuItem>
                  <MenuItem value="weekly">Semanalmente</MenuItem>
                  <MenuItem value="monthly">Mensalmente</MenuItem>
                  <MenuItem value="yearly">Anualmente</MenuItem>
                </Select>
              </FormControl>

              {taskForm.repeat !== 'none' && (
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DateTimePicker
                    label="Repetir até"
                    value={taskForm.repeatUntil || null}
                    onChange={(newDate) => setTaskForm({ ...taskForm, repeatUntil: newDate || undefined })}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#f8f9fa',
                        '&:hover': {
                          backgroundColor: '#f3f4f6',
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #f0f0f0' }}>
          <Button
            onClick={() => setOpenTaskForm(false)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleTaskFormSubmit}
            variant="contained"
            disabled={!taskForm.title}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleEdit}>Editar</MenuItem>
        <MenuItem onClick={handleDelete}>Excluir</MenuItem>
      </Menu>
    </Box>
  );
}