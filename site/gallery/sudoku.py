# Boris Borcic 2006
# Quick and concise Python 2.5 sudoku solver
#
# Adapted for Brython by Pierre Quentel

# load pre-computed tables
import json
data = json.loads(open('sudoku.json').read())
w2q = data['w2q']
q2w = data['q2w']
w2q2w = data['w2q2w']

class Completed(Exception) : pass

def sudoku99(problem) :
    givens = list(9*j+int(k)-1 for j,k in enumerate(problem[:81]) if '0'<k)
    try :
        search(givens,[9]*len(q2w),set(),set())
    except Completed as ws :
        return ''.join(str(w%9+1) for w in sorted(ws.args[0]))

def search(w0s,q2nw,takens,ws) :
    while 1 :
        i = 0
        while w0s:
            w0 = w0s.pop()
            takens.add(w0)
            ws.add(w0)
            for q in w2q[w0] : q2nw[q]+=100

            for w in set(w2q2w[w0]) - takens :
                takens.add(w)
                for q in w2q[w] :
                    n = q2nw[q] = q2nw[q]-1
                    if n<2 :
                        w0s.append((set(q2w[q])-takens).pop())
        if len(ws)>80 :
            raise Completed(ws)
        w1,w0 = set(q2w[q2nw.index(2)])-takens 
        try : search([w1],q2nw[:],takens.copy(),ws.copy())
        except KeyError : 
            w0s.append(w0)

if __name__=='__main__':
    #print(sudoku99('530070000600195000098000060800060003400803001700020006060000280000419005000080079'))
    data = '004050003'+'906400000'+'130006000'+'020310000'+'090000080'+'000047050'+\
        '000070038'+'000002709'+'600090100'
    print(sudoku99(data))


