# -*- coding: utf-8 -*-
# The Computer Language Benchmarks Game
# https://salsa.debian.org/benchmarksgame-team/benchmarksgame/

# Contributed by Sebastien Loisel
# Fixed by Isaac Gouy
# Sped up by Josh Goldfoot
# Dirtily sped up by Simon Descarpentries
# Concurrency by Jason Stitt
# 2to3

from multiprocessing import Pool
from math            import sqrt

from sys             import argv

def eval_A(i, j):
    return 1.0 / ((i + j) * (i + j + 1) / 2 + i + 1)

def eval_A_times_u(u):
    args = ((i,u) for i in range(len(u)))
    return pool.map(part_A_times_u, args)

def eval_At_times_u(u):
    args = ((i,u) for i in range(len(u)))
    return pool.map(part_At_times_u, args)

def eval_AtA_times_u(u):
    return eval_At_times_u (eval_A_times_u (u))

def part_A_times_u(i_and_u):
    (i,u) = i_and_u
    partial_sum = 0
    for j, u_j in enumerate(u):
        partial_sum += eval_A (i, j) * u_j
    return partial_sum

def part_At_times_u(i_and_u):
    (i,u) = i_and_u
    partial_sum = 0
    for j, u_j in enumerate(u):
        partial_sum += eval_A (j, i) * u_j
    return partial_sum

def main():
    n = int(argv[1])
    u = [1] * n

    for dummy in range (10):
        v = eval_AtA_times_u (u)
        u = eval_AtA_times_u (v)

    vBv = vv = 0

    for ue, ve in zip (u, v):
        vBv += ue * ve
        vv  += ve * ve

    print("%0.9f" % (sqrt(vBv/vv)))

if __name__ == '__main__':
    pool = Pool(processes=4)
    main()
